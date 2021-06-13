// DO NOT INSTRUMENT
import {debug as _debug} from "debug";

const debug = _debug("slim_taser:meta");

export class MetaStoreHelper {
    public static META_KEY = "mapping23$^42";

    constructor(public defaultMeta: any) {
    }

    store(object: { [index: string]: any }, prop: PropertyKey, meta: any) {
        debug("Storing (%s, %s) in object %s", prop, meta, object);
        let mapping = object[MetaStoreHelper.META_KEY];
        if (!mapping) {
            debug("Creating fresh meta store!");
            mapping = this.createMetaStore(object);
        }
        mapping[prop] = meta;
    }

    read(object: { [index: string]: any }, prop: PropertyKey): any {
        let meta = this.defaultMeta;
        try {
            let storedMeta = object[MetaStoreHelper.META_KEY];
            if (storedMeta && storedMeta[prop]) {
                meta = storedMeta[prop];
            } else {
                debug("Read meta property %s missed. Returning default.", prop);
            }
        } catch (e) {
            debug("Read meta property %s failed. Returning default.", prop);
        }
        return meta;
    }

    private createMetaStore(object: { [index: string]: any }) {
        try {
            Object.defineProperty(object, MetaStoreHelper.META_KEY, {enumerable: false, writable: true});
            object[MetaStoreHelper.META_KEY] = Object.create(null);
            return object[MetaStoreHelper.META_KEY];
        } catch (e) {
            debug("Failed to create meta store on object: %s", e);
            return {};
        }
    }
}