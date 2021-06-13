// DO NOT INSTRUMENT
import {JalangiAnalysis} from "./jalangi";
import {Jalangi} from "./types/Jalanig";
import {NamedFunction} from "./types/Extensions";
import {debug as _debug} from "debug";
import path from "path";
import {MetaStoreHelper} from "./meta";

const debug = _debug("slim_taser:main");
const nodeRequire = require;
declare var J$: Jalangi;

function getEnvVarOrFail(varName: string): string {
    let val = process.env[varName];
    if (val == undefined) {
        throw new Error(varName + " envvar not defined!");
    }
    return val;
}

class BorderSink {
    constructor(public repr: string, public f: NamedFunction) {
    }
}

class KnownSink {
    constructor(public f: Function, public name: string, public argumentFilter: (args: any[]) => boolean) {
    }
}

class SomeAnalysis extends JalangiAnalysis {
    private readonly libraryUnderTest: string;
    private readonly lutRootDirectory: string;
    private entryPoints: BorderSink[] = [];
    private knownSinks: KnownSink[] = [];
    private metaStore = new MetaStoreHelper(false);
    private static TAINTED_META_KEY = "tainted";

    constructor() {
        super();
        this.libraryUnderTest = getEnvVarOrFail("LIBRARY_UNDER_TEST");
        this.lutRootDirectory = getEnvVarOrFail("LIBRARY_ROOT_DIR");
        this.registerKnownSinks();
    }

    private registerKnownSinks(): void {
        console.log("Registering known sinks!");
        //@ts-ignore
        const cp = require("child_process");
        this.knownSinks.push(new KnownSink(cp.exec, "child_process.exec", (args => {
            if (args.length < 1) return false;
            let meta = this.metaStore.read(args[0], SomeAnalysis.TAINTED_META_KEY);
            return <boolean>meta;
        })));
    }

    invokeFunPre(iid: number, f: NamedFunction, base: Object, args: any[], isConstructor: boolean, isMethod: boolean, functionIid: number, functionSid: number): { f: NamedFunction; base: object; args: Array<any>; skip: boolean } | undefined {
        let oArgs = args;

        for (let kSink of this.knownSinks) {
            if (f === kSink.f) {
                console.log("Reached the known sink [%s]", kSink.name);
                oArgs.forEach((arg, i) => console.log("Argument %d is: value=[%s] tainted=[%s]", i, arg, this.metaStore.read(arg, SomeAnalysis.TAINTED_META_KEY)));
                console.log("Known sinks arguments tainted evaluate to: ", kSink.argumentFilter(oArgs));
            }
        }
        for (let entryPoint of this.entryPoints) {
            if (f === entryPoint.f) {
                // If I'm in an entrypoint, and there are native type arguments, override them with their object counterparts
                oArgs = args.map(arg => {
                    if (["string", "number", "boolean"].includes(typeof arg)) return nativeToObject(arg);
                    return arg;
                })

                // Mark as tainted all args in this entrypoint
                console.log("Entrypoint reached [%s]", entryPoint.repr);
                oArgs.forEach(arg => this.metaStore.store(arg, SomeAnalysis.TAINTED_META_KEY, true));
                oArgs.forEach((arg, i) => console.log("Argument %d is: value=[%s] tainted=[%s]", i, arg, this.metaStore.read(arg, SomeAnalysis.TAINTED_META_KEY)));
            }
        }

        return {f: f, args: oArgs, base: base, skip: false};
    }

    invokeFun(iid: number, f: NamedFunction, base: any, args: any[], result: any, isConstructor: boolean, isMethod: boolean, functionIid: number, functionSid: number): { result: any } | undefined {
        //@ts-ignore
        // FIXME: Try to observe require call by doing something like `f === require`
        if (f.name === "require" && typeof args[0] === "string" && (<string>args[0]).startsWith(".")) {
            debug("require called is equal to NodeRequire: ", f === nodeRequire);
            debug("Found local require. Capturing entrypoints!");
            let actualLut = result;
            let requireLocation = <string>args[0];
            let jLocation = J$.iidToLocation(J$.getGlobalIID(iid));
            let jLocationFile = jLocation.split(":")[0].substring(1);
            let resolvedRequirePath = path.resolve(path.dirname(jLocationFile), requireLocation);
            debug("Require with the following info: location=[%s] requireString=[%s] resolvedString=[%s]", jLocation, requireLocation, resolvedRequirePath);

            if (resolvedRequirePath.startsWith(this.lutRootDirectory) && !resolvedRequirePath.includes("node_modules")) {
                if (typeof actualLut === "function") {
                    // The module just exports a function. Sth like `module.exports = function( ...`
                    this.entryPoints.push(funToBorderSink(this.libraryUnderTest, actualLut as NamedFunction, true));
                    debug("Library under test [%s] just exports one function named [%s]", this.libraryUnderTest, this.entryPoints[0].repr);
                } else {
                    // Module must export several things
                    for (let [key, value] of Object.entries(actualLut)) {
                        if (typeof value === "function") {
                            let valueAsNF = value as NamedFunction;
                            this.entryPoints.push(funToBorderSink(this.libraryUnderTest, valueAsNF, false, key));
                            debug("Discovered entrypoint called [%s]", key);
                        }
                    }
                }
            }
        }
        return {result: result};
    }

    endExecution(): void {
        console.log("Discovered %d entrypoints: %s", this.entryPoints.length, this.entryPoints.map(ep => ep.repr).join(","));
    }
}

function nativeToObject(v: string | number | boolean): Object {
    if (typeof v === "string") {
        return new String(v);
    } else if (typeof v === "number") {
        return new Number(v);
    } else {
        return new Boolean(v);
    }
}

function funToBorderSink(requireCtx: string, f: NamedFunction, isSingleExport: boolean, overrideName?: string): BorderSink {
    let repr = `root ${requireCtx}`;
    if (isSingleExport) {
        repr = `return (${repr})`;
    } else {
        let fName = overrideName != undefined ? overrideName : f.name;
        repr = `member ${fName} (${repr})`;
    }
    return new BorderSink(repr, f);
}

//@ts-ignore
(function (sb) {
    let analysis = new SomeAnalysis();
    sb.addAnalysis(analysis);
})(J$);