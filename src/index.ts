import {JalangiAnalysis} from "./jalangi";
import {Jalangi} from "./types/Jalanig";
import {NamedFunction} from "./types/Extensions";
import {debug as _debug} from "debug";
import path from "path";

const debug = _debug("slim_taser");
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
    constructor(public repr: string, public val: NamedFunction) {
    }
}

class KnownSink {
    constructor(public f: Function, public name: string) {
    }
}

// DO NOT INSTRUMENT
class SomeAnalysis extends JalangiAnalysis {
    private readonly libraryUnderTest: string;
    private readonly lutRootDirectory: string;
    private entryPoints: BorderSink[] = [];
    private knownSinks: KnownSink[] = [];

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
        this.knownSinks.push(new KnownSink(cp.exec, "child_process.exec"));
    }

    invokeFunPre(iid: number, f: NamedFunction, base: Object, args: Object[], isConstructor: boolean, isMethod: boolean, functionIid: number, functionSid: number): { f: NamedFunction; base: object; args: Array<any>; skip: boolean } | undefined {
        debug("Called function named: %s", f.name);
        for (let kSink of this.knownSinks) {
            if (f === kSink.f) {
                console.log("Reached the known sink [%s]", kSink.name);
            }
        }
        return super.invokeFunPre(iid, f, base, args, isConstructor, isMethod, functionIid, functionSid);
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
                            this.entryPoints.push(funToBorderSink(this.libraryUnderTest, actualLut as NamedFunction, false));
                            debug("Discovered entrypoint called [%s]", valueAsNF.name);
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

function funToBorderSink(requireCtx: string, f: NamedFunction, isSingleExport: boolean): BorderSink {
    let repr = `root ${requireCtx}`;
    if (isSingleExport) {
        repr = `return (${repr})`;
    } else {
        repr = `member ${f.name} (${repr})`;
    }
    return new BorderSink(repr, f);
}

//@ts-ignore
(function (sb) {
    let analysis = new SomeAnalysis();
    sb.addAnalysis(analysis);
})(J$);