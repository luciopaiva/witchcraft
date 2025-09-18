import {evictStale} from "./evict-stale.js";
import {browser} from "../browser.js";
import {util} from "../util/index.js";
import {DEFAULT_SERVER_ADDRESS} from "../constants.js";

const SERVER_ADDRESS_KEY = "server-address";
const SERVER_STATUS_KEY = "server-status";

const EVICTION_TIME_KEY = "eviction-time";
const FRAME_SCRIPTS_KEY_PREFIX = "frame-scripts";
const TAB_SCRIPT_COUNT_KEY_PREFIX = "tab-script-count";
const ICON_KEY_PREFIX = "icon";

async function clear() {
    await browser.clearStorage();
}

function makeIconKey(iconName) {
    return `${storage.ICON_KEY_PREFIX}:${iconName}`;
}

function makeTabScriptCountKey(tabId) {
    return `${storage.TAB_SCRIPT_COUNT_KEY_PREFIX}:${tabId}`;
}

async function removeFrame(tabId, frameId) {
    await browser.removeKey(storage.frameScriptsKey(tabId, frameId));
}

async function retrieveServerStatus() {
    return (await browser.retrieveKey(SERVER_STATUS_KEY)) || false;
}

async function storeIcon(iconName, iconData) {
    const encoded = util.typedArrayToBase64(iconData);
    await browser.storeKey(storage.makeIconKey(iconName), encoded);
}

async function storeServerAddress(address) {
    await browser.storeKey(SERVER_ADDRESS_KEY, address);
}

async function storeServerStatus(status) {
    await browser.storeKey(SERVER_STATUS_KEY, status);
}

async function storeFrame(tabId, frameId, scriptNames) {
    await browser.storeKey(storage.frameScriptsKey(tabId, frameId), {
        tabId,
        frameId,
        scriptNames,
    });
}

async function retrieveIcon(iconName) {
    const base64 = await browser.retrieveKey(storage.makeIconKey(iconName));
    return util.base64ToTypedArray(base64, Uint8ClampedArray);
}

async function incrementTabScriptCount(tabId, increment) {
    const key = storage.makeTabScriptCountKey(tabId);
    const result = await browser.retrieveKey(key);
    const newCount = (result?.count ?? 0) + increment;
    await browser.storeKey(key, {
        tabId,
        count: newCount,
    });
    return newCount;
}

function frameScriptsKey(tabId, frameId) {
    return `${storage.FRAME_SCRIPTS_KEY_PREFIX}:${tabId}:${frameId}`;
}

async function retrieveServerAddress(defaultAddress = DEFAULT_SERVER_ADDRESS) {
    return (await browser.retrieveKey(SERVER_ADDRESS_KEY)) ?? defaultAddress;
}

async function removeTabScriptSet(tabId) {
    const tabKey = storage.makeTabScriptCountKey(tabId);
    await browser.removeKey(tabKey);
}

async function addToTabScriptSet(tabId, frameId, scripts) {
    const scriptKeys = scripts.map(script => `${frameId}:${script}`);
    const tabKey = storage.makeTabScriptCountKey(tabId);
    const tabResult = await browser.retrieveKey(tabKey);
    const existingScripts = tabResult?.scripts ? JSON.parse(tabResult?.scripts) : [];

    const updatedScripts = new Set([...existingScripts, ...scriptKeys]);

    await browser.storeKey(tabKey, {
        tabId,
        scripts: JSON.stringify(Array.from(updatedScripts)),
    });
    return updatedScripts.size;
}

async function retrieveFrame(tabId, frameId) {
    return await browser.retrieveKey(storage.frameScriptsKey(tabId, frameId));
}

async function retrieveAllFrames(tabId) {
    const entries = await browser.retrieveAllEntries() ?? [];
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
        await browser.removeKey(key);
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
