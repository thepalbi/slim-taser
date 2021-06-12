import {JalangiAnalysis} from "./jalangi";
import {Jalangi} from "./types/Jalanig";
import {NamedFunction} from "./types/Extensions";

declare var J$: Jalangi;

// DO NOT INSTRUMENT
class SomeAnalysis extends JalangiAnalysis {
    invokeFunPre(iid: number, f: NamedFunction, base: Object, args: Object[], isConstructor: boolean, isMethod: boolean, functionIid: number, functionSid: number): { f: NamedFunction; base: object; args: Array<any>; skip: boolean } | undefined {
        console.log("Called function named: %s", f.name);
        return super.invokeFunPre(iid, f, base, args, isConstructor, isMethod, functionIid, functionSid);
    }
}

//@ts-ignore
(function (sb) {
    const analysis = new SomeAnalysis();
    sb.addAnalysis(analysis);
})(J$);