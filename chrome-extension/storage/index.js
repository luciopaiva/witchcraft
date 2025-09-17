import {evictStale} from "./evict-stale.js";
import {browser} from "../browser/index.js";
import {util} from "../util/index.js";
import {DEFAULT_SERVER_ADDRESS} from "../constants.js";

const SERVER_ADDRESS_KEY = "server-address";
const SERVER_STATUS_KEY = "server-status";

const EVICTION_TIME_KEY = "eviction-time";
const FRAME_SCRIPTS_KEY_PREFIX = "frame-scripts";
const TAB_SCRIPT_COUNT_KEY_PREFIX = "tab-script-count";
const ICON_KEY_PREFIX = "icon";

async function clear() {
    await browser.api.clearStorage();
}

function makeIconKey(iconName) {
    return `${storage.ICON_KEY_PREFIX}:${iconName}`;
}

function makeTabScriptCountKey(tabId) {
    return `${storage.TAB_SCRIPT_COUNT_KEY_PREFIX}:${tabId}`;
}

async function removeFrame(tabId, frameId) {
    await browser.api.removeKey(storage.frameScriptsKey(tabId, frameId));
}

async function retrieveServerStatus() {
    return (await browser.api.retrieveKey(SERVER_STATUS_KEY)) || false;
}

async function storeIcon(iconName, iconData) {
    const encoded = util.typedArrayToBase64(iconData);
    await browser.api.storeKey(storage.makeIconKey(iconName), encoded);
}

async function storeServerAddress(address) {
    await browser.api.storeKey(SERVER_ADDRESS_KEY, address);
}

async function storeServerStatus(status) {
    await browser.api.storeKey(SERVER_STATUS_KEY, status);
}

async function storeFrame(tabId, frameId, scriptNames) {
    await browser.api.storeKey(storage.frameScriptsKey(tabId, frameId), {
        tabId,
        frameId,
        scriptNames,
    });
}

async function retrieveIcon(iconName) {
    const base64 = await browser.api.retrieveKey(storage.makeIconKey(iconName));
    return util.base64ToTypedArray(base64, Uint8ClampedArray);
}

async function incrementTabScriptCount(tabId, increment) {
    const key = storage.makeTabScriptCountKey(tabId);
    const result = await browser.api.retrieveKey(key);
    const newCount = (result?.count ?? 0) + increment;
    await browser.api.storeKey(key, {
        tabId,
        count: newCount,
    });
    return newCount;
}

function frameScriptsKey(tabId, frameId) {
    return `${storage.FRAME_SCRIPTS_KEY_PREFIX}:${tabId}:${frameId}`;
}

async function retrieveServerAddress(defaultAddress = DEFAULT_SERVER_ADDRESS) {
    return (await browser.api.retrieveKey(SERVER_ADDRESS_KEY)) ?? defaultAddress;
}

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
    storeServerStatus,
    retrieveServerStatus,
}
