
import {storage} from "../../storage/index.js";
import {browser} from "../index.js";

async function clear(tabId) {
    await storage.removeTabScriptSet(tabId);
    await badge.setCount(tabId, 0);
}

async function increment(tabId, delta) {
    const totalCount = await storage.incrementTabScriptCount(tabId, delta);
    await badge.setCount(tabId, totalCount);
}

async function registerScripts(tabId, frameId, scripts) {
    const totalCount = await storage.addToTabScriptSet(tabId, frameId, scripts);
    await badge.setCount(tabId, totalCount);
}

async function setCount(tabId, count) {
    const countStr = count > 999 ? "999+" : (count > 0 ? count.toString() : "");
    await browser.setBadgeText(tabId, countStr);
}

export const badge = {
    clear,
    increment,
    registerScripts,
    setCount,
};
