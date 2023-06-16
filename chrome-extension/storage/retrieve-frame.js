import {browser} from "../browser/index.js";
import {storage} from "./index.js";

export async function retrieveFrame(tabId, frameId) {
    return await browser.api.retrieveKey(storage.frameScriptsKey(tabId, frameId));
}
