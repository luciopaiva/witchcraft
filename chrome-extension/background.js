import {loader} from "./loader/index.js";
import {storage} from "./storage/index.js";
import {browser} from "./browser/index.js";
import {icon} from "./icon/index.js";
import {analytics} from "./analytics/index.js";

analytics.event.backgroundLoaded();
browser.api.onInstalled(async () => {
    console.info("Extension installed.");
    analytics.event.installed();
});
browser.api.onSuspend(async () => {
    console.info("Extension suspended");
    analytics.event.suspended();
});
browser.api.onNewFrame(async details => {
    const { url, tabId, frameId } = details;
    console.info(`Committed url ${url} in tab ${tabId} frame ${frameId}, transition type ${details.transitionType}`);
    const metrics = await loader.loadScripts(url, tabId, frameId);
    metrics.hasData && analytics.event.scriptsLoaded(metrics);
    await storage.evictStale();
});

icon.initialize().then();
