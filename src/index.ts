import {JalangiAnalysis} from "./jalangi";
import {Jalangi} from "./types/Jalanig";
import {NamedFunction} from "./types/Extensions";
import {debug as _debug} from "debug";

const debug = _debug("slim_taser");
const nodeRequire = require;
declare var J$: Jalangi;

// DO NOT INSTRUMENT
class SomeAnalysis extends JalangiAnalysis {
    private readonly libraryUnderTest: string;
    private entryPoints: NamedFunction[] = [];

    constructor() {
        super();
        const lut = process.env.LIBRARY_UNDER_TEST;
        if (lut == undefined) {
            throw new Error("LIBRARY_UNDER_TEST envvar not defined!");
        }
        this.libraryUnderTest = lut;
    }

    invokeFunPre(iid: number, f: NamedFunction, base: Object, args: Object[], isConstructor: boolean, isMethod: boolean, functionIid: number, functionSid: number): { f: NamedFunction; base: object; args: Array<any>; skip: boolean } | undefined {
        debug("Called function named: %s", f.name);
        return super.invokeFunPre(iid, f, base, args, isConstructor, isMethod, functionIid, functionSid);
    }

    invokeFun(iid: number, f: NamedFunction, base: any, args: any[], result: any, isConstructor: boolean, isMethod: boolean, functionIid: number, functionSid: number): { result: any } | undefined {
        //@ts-ignore
        if (f === nodeRequire && typeof args[0] === "string" && <string>args[0].startsWith(".")) {
            let actualLut = result;
            if (typeof actualLut === "function") {
                // The module just exports a function. Sth like `module.exports = function( ...`
                this.entryPoints = [actualLut as NamedFunction];
                debug("Library under test [%s] just exports one function named [%s]", this.libraryUnderTest, this.entryPoints[0].name);
            } else {
                // Module must export several things
                for (let [key, value] of Object.entries(actualLut)) {
                    if (typeof value === "function") {
                        let valueAsNF = value as NamedFunction;
                        this.entryPoints.push(valueAsNF);
                        debug("Discovered entrypoint called [%s]", valueAsNF.name);
                    }
                }
            }
        }
    }

    endExecution(): void {
        console.log("Discovered entrypoints: %s", this.entryPoints.map(ep => ep.name).join(","));
    }
}

//@ts-ignore
(function (sb) {
    const analysis = new SomeAnalysis();
    sb.addAnalysis(analysis);
})(J$);