import {chromeApi} from "./index.js";

const NAVIGATION_FILTER = { url: [{ schemes: ["http", "https", "file", "ftp"] }] };

export function onCommitted(callback) {
    chromeApi.chrome().webNavigation.onCommitted.addListener(callback, NAVIGATION_FILTER);
}
