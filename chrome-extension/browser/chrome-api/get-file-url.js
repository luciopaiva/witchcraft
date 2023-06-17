import {chromeApi} from "./index.js";

export function getFileUrl(path) {
    return chromeApi.chrome().runtime.getURL(path);
}
