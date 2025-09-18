import {browser} from "../browser.js";
import {storage} from "./index.js";

const EVICTION_PERIOD_IN_MILLIS = 1000 * 60 * 10;  // 10 min

export async function evictStale() {
    const now = Date.now();
    if (await isItTimeToEvict(now)) {
        await browser.storeKey(storage.EVICTION_TIME_KEY, now + EVICTION_PERIOD_IN_MILLIS);
        await lookForKeysToEvict();
    }
}

async function lookForKeysToEvict() {
    console.info("Looking for old cache entries to evict...");

    let removedCount = 0;
    for (const entry of await browser.retrieveAllEntries()) {
        const [key, value] = entry;
        if (key.startsWith(storage.FRAME_SCRIPTS_KEY_PREFIX)) {
            const {tabId, frameId} = value;
            removedCount += (await tryEvictFrameKey(key, tabId, frameId)) ? 1 : 0;
        } else if (key.startsWith(storage.TAB_SCRIPT_COUNT_KEY_PREFIX)) {
            const {tabId} = value;
            removedCount += (await tryEvictTabScriptCountKey(key, tabId)) ? 1 : 0;
        }
    }

    console.info(`Entries removed: ${removedCount}`);
}

async function tryEvictFrameKey(key, tabId, frameId) {
    if (!(await doesFrameExist(tabId, frameId))) {
        // console.info(`Removing key ${key}...`);
        await storage.removeFrame(tabId, frameId);
        return true;
    }
    return false;
}

async function tryEvictTabScriptCountKey(key, tabId) {
    if (!(await doesFrameExist(tabId, 0))) {
        // console.info(`Removing key ${key}...`);
        await storage.removeTabScriptSet(tabId);
        return true;
    }
    return false;
}

async function doesFrameExist(tabId, frameId) {
    return !!(await browser.getFrame(tabId, frameId));
}

async function isItTimeToEvict(now) {
    const nextTime = await browser.retrieveKey(storage.EVICTION_TIME_KEY);
    return (nextTime ?? 0) < now;
}
