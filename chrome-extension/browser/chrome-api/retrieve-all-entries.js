
import {chromeApi} from "./index.js";

export async function retrieveAllEntries() {
    return new Promise(resolve => {
        chromeApi.chrome().storage.local.get(result => resolve(Object.entries(result)));
    });
}
