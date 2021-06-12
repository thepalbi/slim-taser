import {JalangiAnalysis} from "./jalangi";
import {Jalangi} from "./types/Jalanig";

declare var J$: Jalangi;

class SomeAnalysis extends JalangiAnalysis {
    invokeFunPre(iid: number, f: Function, base: Object, args: Object[], isConstructor: boolean, isMethod: boolean, functionIid: number, functionSid: number): { f: Function; base: object; args: Array<any>; skip: boolean } | undefined {
        console.log("Called function named: %s", f.toString());
        return super.invokeFunPre(iid, f, base, args, isConstructor, isMethod, functionIid, functionSid);
    }
}

//@ts-ignore
(function (sb) {
    const analysis = new SomeAnalysis();
    sb.addAnalysis(analysis);
})(J$);