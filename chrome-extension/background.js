import {loader} from "./loader.js";
import {storage} from "./storage/index.js";
import {browser} from "./browser.js";
import {icon} from "./icon.js";
import {analytics} from "./analytics/index.js";

analytics.events.backgroundLoaded();
browser.onInstalled(async () => {
    console.info("Extension installed.");
    analytics.events.installed();
});
browser.onSuspend(async () => {
    console.info("Extension suspended");
    analytics.events.suspended();
});

browser.onMessage(async (message, sender) => {
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
