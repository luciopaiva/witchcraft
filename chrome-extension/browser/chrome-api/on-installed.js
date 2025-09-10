import {chromeApi} from "./index.js";

export function onInstalled(callback) {
    chromeApi.chrome().runtime.onInstalled.addListener(callback);
}
