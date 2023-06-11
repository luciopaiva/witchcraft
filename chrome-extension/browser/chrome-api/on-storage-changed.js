import {chromeApi} from "./index.js";

export function onStorageChanged(callback) {
    chromeApi.chrome().storage.onChanged.addListener(callback);
}
