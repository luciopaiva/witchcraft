
import {chromeApi} from "./index.js";

export async function removeKey(key) {
    return new Promise(resolve => {
        chromeApi.chrome().storage.local.remove(key, resolve);
    });
}
