import {chromeApi} from "./index.js";

export async function onInstalled(callback) {
    chromeApi.chrome().runtime.onInstalled.addListener(callback);
}
