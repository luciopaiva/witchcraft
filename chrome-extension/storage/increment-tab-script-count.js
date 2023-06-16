import {browser} from "../browser/index.js";
import {storage} from "./index.js";

export async function incrementTabScriptCount(tabId, increment) {
    const key = storage.makeTabScriptCountKey(tabId);
    const result = await browser.api.retrieveKey(key);
    const newCount = (result?.count ?? 0) + increment;
    await browser.api.storeKey(key, {
        tabId,
        count: newCount,
    });
    return newCount;
}
