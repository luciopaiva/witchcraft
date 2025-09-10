
import {chromeApi} from "./index.js";

export async function retrieveKey(key) {
    return new Promise(resolve => {
        chromeApi.chrome().storage.local.get(key, result => {
            resolve(result[key]);
        });
    });
}
