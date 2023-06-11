import {browser} from "../browser/index.js";
import {storage} from "./index.js";

export async function storeFrame(tabId, frameId, scriptNames) {
    await browser.api.storeKey(storage.frameKey(tabId, frameId), {
        tabId,
        frameId,
        scriptNames,
    });
}
