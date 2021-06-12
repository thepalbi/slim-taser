export interface Jalangi {

    smap: { [key: number]: any };

    initParams?: any;

    sid: iid;

    getGlobalIID(iid: iid): giid;

    iidToLocation(iid: giid): string;

    iidToSourceObject(iid: giid):
        { name: string, loc: CodeSnippetLocation, range: [] };

    analysis?: JalangiAnalysis;

    addAnalysis(analysis: JalangiAnalysis): void;

    addAnalysis(analysis: JalangiAnalysis, filterConfig: { [key: string]: any }): void;

    smemory?: {

        getShadowObject(
            obj: object,
            prop: string,
            isGetField: boolean
        ): { owner: object, isProperty: boolean };

        getShadowFrame(name: string): object;

        getIDFromShadowObjectOrFrame(obj: object): number | void;

        getActualObjectOrFunctionFromShadowObjectOrFrame(obj: object): any;

        getFrame(name: string): object;

        getShadowObjectOfObject(val: object): object | void;

    };
}
