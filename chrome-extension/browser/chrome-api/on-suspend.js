import {chromeApi} from "./index.js";

export function onSuspend(callback) {
    chromeApi.chrome().runtime.onSuspend.addListener(() => callback);
}
