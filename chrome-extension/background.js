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
import {DEFAULT_SERVER_ADDRESS} from "./constants.js";

chrome.runtime.onInstalled.addListener(async () => {
    console.info("Extension installed!");
});

chrome.runtime.onSuspend.addListener(() => {
    console.info("Suspended!");
});

const NAVIGATION_FILTER = { url: [{ schemes: ["http", "https", "file", "ftp"] }] };

chrome.webNavigation.onCommitted.addListener(async (details) => {
    const { url, tabId, frameId } = details;
    await loader.loadScripts(url, tabId, frameId);
    storage.evictStale().then(() => { /* fire and forget */ });
}, NAVIGATION_FILTER);
