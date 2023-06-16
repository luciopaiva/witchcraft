import {browser} from "../browser/index.js";
import {storage} from "./index.js";

export async function removeTabScriptCount(tabId) {
    const key = storage.makeTabScriptCountKey(tabId);
    await browser.api.storeKey(key, {
        tabId,
        count: 0,
    });
}
