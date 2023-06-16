import {browser} from "../index.js";

export async function set(tabId, count) {
    const countStr = count > 999 ? "999+" : (count > 0 ? count.toString() : "");
    await browser.api.setBadgeText(tabId, countStr);
}
