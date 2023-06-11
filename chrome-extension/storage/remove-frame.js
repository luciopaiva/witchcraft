import {browser} from "../browser/index.js";
import {storage} from "./index.js";

export async function removeFrame(tabId, frameId) {
    await browser.api.removeKey(storage.frameKey(tabId, frameId));
}
