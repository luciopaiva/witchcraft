import {chromeApi} from "./index.js";

export async function onSuspend(callback) {
    chromeApi.chrome().runtime.onSuspend.addListener(() => callback);
}
