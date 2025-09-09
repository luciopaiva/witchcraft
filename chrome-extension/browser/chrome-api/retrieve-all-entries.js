
import {chromeApi} from "./index.js";

export async function retrieveAllEntries() {
    const result = await chromeApi.chrome().storage.local.get();
    return Object.entries(result);
}
