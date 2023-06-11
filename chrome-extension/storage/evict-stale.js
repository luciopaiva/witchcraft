import {browser} from "../browser/index.js";
import {storage} from "./index.js";

const EVICTION_PERIOD_IN_MILLIS = 1000 * 60 * 10;  // 10 min

export async function evictStale() {
    const now = Date.now();
    if (await isItTimeToEvict(now)) {
        await browser.api.storeKey(storage.EVICTION_TIME_KEY, now + EVICTION_PERIOD_IN_MILLIS);
        await lookForKeysToEvict();
    }
}

async function lookForKeysToEvict() {
    console.info("Looking for old cache entries to evict...");

    let removedCount = 0;
    for (const entry of await browser.api.retrieveAllEntries()) {
        const [key,value] = entry;
        if (key.startsWith(storage.FRAME_KEY_PREFIX)) {
            const {tabId, frameId} = value;
            removedCount += (await tryEvictKey(tabId, frameId)) ? 1 : 0;
        }
    }

    console.info(`Entries removed: ${removedCount}`);
}

async function tryEvictKey(tabId, frameId) {
    const frame = await browser.api.getFrame(tabId, frameId);
    if (!frame) {
        console.info(`Removing ${tabId}:${frameId}...`);
        await storage.removeFrame(tabId, frameId);
        return true;
    }
    return false;
}

async function isItTimeToEvict(now) {
    const nextTime = await browser.api.retrieveKey(storage.EVICTION_TIME_KEY);
    return (nextTime ?? 0) < now;
}
