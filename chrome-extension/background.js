import {loader} from "./loader/index.js";
import {storage} from "./storage/index.js";
import {browser} from "./browser/index.js";
import {icon} from "./icon/index.js";
import {analytics} from "./analytics/index.js";

analytics.events.backgroundLoaded();
browser.api.onInstalled(async () => {
    console.info("Extension installed.");
    analytics.events.installed();
});
browser.api.onSuspend(async () => {
    console.info("Extension suspended");
    analytics.events.suspended();
});

chrome.runtime.onMessage.addListener(async (message, sender) => {
    const url = message.href;
    const tabId = sender.tab?.id;
    const frameId = sender.frameId;

    if (typeof url === "string" && typeof tabId === "number" && typeof frameId === "number") {
        const metrics = await loader.loadScripts(url, tabId, frameId);
        metrics.hasData && analytics.events.scriptsLoaded(metrics);
        await storage.evictStale();
    }
});

icon.initialize().then();
