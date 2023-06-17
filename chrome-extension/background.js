// ToDo import analytics from sss.google-analytics.com
// import "./analytics";
// import "./witchcraft";

// // bind it to window so it can be accessed from the popup screen
// if (typeof Analytics === "function") {  // will be undefined during tests
//     window.analytics = new Analytics();
//     window.analytics.send("Background", "Load");
// }

// // bind it to window so it can be accessed from the popup screen
// window.witchcraft = new Witchcraft(chrome, typeof document !== "undefined" ? document : undefined, window.analytics);

import {loader} from "./loader/index.js";
import {storage} from "./storage/index.js";
import {browser} from "./browser/index.js";
import {icon} from "./icon/index.js";

// erase any potentially incompatible data from an eventual previous version
await storage.clear();

browser.api.onInstalled(() => console.info("Extension installed!"));
browser.api.onSuspend(() => console.info("Suspended!"));
browser.api.onNewFrame(async details => {
    const { url, tabId, frameId } = details;
    await loader.loadScripts(url, tabId, frameId);
    await storage.evictStale();
});

await icon.initialize();
