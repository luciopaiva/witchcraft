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

import { loader } from "./loader/index.js";

chrome.runtime.onInstalled.addListener(() => {
    console.info("Extension installed!");
});

chrome.runtime.onSuspend.addListener(() => {
    console.info("Suspended!");
});
//
// chrome.webNavigation.onCommitted.addListener(async (details) => {
//     const { url, tabId, frameId } = details;
//     await loader.loadScripts(url, tabId, frameId);
// });

// Listen for messages from the content script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.info(sender);
    // // Retrieve the tabId from the content script
    // var tabId = message.tabId;
    //
    // // Process the tabId as needed
    // console.log('TabId received from content script:', tabId);
    //
    // // Send a response back to the content script
    // sendResponse({ response: 'success', tabId: tabId });
    //
    chrome.scripting.executeScript({
        func: () => console.info("hello content!"),
        target: {
            tabId: sender.tab.id,
        }
    });
});
