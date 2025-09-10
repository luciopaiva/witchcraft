import {evictStale} from "./evict-stale.js";
import {storeFrame} from "./store-frame.js";
import {frameScriptsKey} from "./frame-scripts-key.js";
import {removeFrame} from "./remove-frame.js";
import {storeServerAddress} from "./store-server-address.js";
import {retrieveServerAddress} from "./retrieve-server-address.js";
import {makeTabScriptCountKey} from "./make-tab-script-count-key.js";
import {incrementTabScriptCount} from "./increment-tab-script-count.js";
import {storeIcon} from "./store-icon.js";
import {retrieveIcon} from "./retrieve-icon.js";
import {makeIconKey} from "./make-icon-key.js";
import {clear} from "./clear.js";
import {browser} from "../browser/index.js";

const EVICTION_TIME_KEY = "eviction-time";
const FRAME_SCRIPTS_KEY_PREFIX = "frame-scripts";
const TAB_SCRIPT_COUNT_KEY_PREFIX = "tab-script-count";
const ICON_KEY_PREFIX = "icon";

async function removeTabScriptSet(tabId) {
    const tabKey = storage.makeTabScriptCountKey(tabId);
    await browser.api.removeKey(tabKey);
}

async function addToTabScriptSet(tabId, frameId, scripts) {
    const scriptKeys = scripts.map(script => `${frameId}:${script}`);
    const tabKey = storage.makeTabScriptCountKey(tabId);
    const tabResult = await browser.api.retrieveKey(tabKey);
    const existingScripts = tabResult?.scripts ? JSON.parse(tabResult?.scripts) : [];

    const updatedScripts = new Set([...existingScripts, ...scriptKeys]);

    await browser.api.storeKey(tabKey, {
        tabId,
        scripts: JSON.stringify(Array.from(updatedScripts)),
    });
    return updatedScripts.size;
}

async function retrieveFrame(tabId, frameId) {
    return await browser.api.retrieveKey(storage.frameScriptsKey(tabId, frameId));
}

async function retrieveAllFrames(tabId) {
    const entries = await browser.api.retrieveAllEntries() ?? [];
    const prefix = `${FRAME_SCRIPTS_KEY_PREFIX}:${tabId}:`;
    const results = {};

    for (const entry of entries) {
        const [key, value] = entry;
        if (key.startsWith(prefix)) {
            results[key] = value;
        }
    }

    return results;
}

async function clearAllFrames(tabId) {
    const keysToRemove = Object.keys(await retrieveAllFrames(tabId));
    for (const key of keysToRemove) {
        await browser.api.removeKey(key);
    }
}

export const storage = {
    EVICTION_TIME_KEY,
    ICON_KEY_PREFIX,
    FRAME_SCRIPTS_KEY_PREFIX,
    TAB_SCRIPT_COUNT_KEY_PREFIX,
    clear,
    evictStale,
    frameScriptsKey,
    incrementTabScriptCount,
    makeIconKey,
    makeTabScriptCountKey,
    removeFrame,
    removeTabScriptSet,
    retrieveFrame,
    retrieveAllFrames,
    clearAllFrames,
    retrieveIcon,
    retrieveServerAddress,
    storeFrame,
    storeIcon,
    storeServerAddress,
    addToTabScriptSet,
}
