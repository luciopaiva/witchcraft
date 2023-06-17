import {chromeApi} from "./index.js";

export async function clearStorage() {
    return new Promise(resolve => chromeApi.chrome().storage.local.clear(resolve));
}
