
import {chromeApi} from "./index.js";

export async function storeKey(key, value) {
    return new Promise(resolve => {
        const obj = {};
        obj[key] = value;
        chromeApi.chrome().storage.local.set(obj, resolve);
    });
}
