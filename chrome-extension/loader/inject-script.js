import {EXT_CSS, EXT_JS} from "../path/map-to-js-and-css.js";

/**
 * @param {ScriptContext} script
 * @param {number} tabId
 * @param {number} frameId
 * @returns {Promise<void>}
 */
export async function injectScript(script, tabId, frameId) {
    if (script.type === EXT_JS) {
        injectJs(script.url, script.contents, tabId, frameId);
    } else if (script.type === EXT_CSS) {
        injectCss(script.url, script.contents, tabId, frameId);
    }
}

function injectJs(url, contents, tabId, frameId) {
    chrome.tabs.executeScript(tabId, {
        code: contents,
        frameId: frameId,
        runAt: "document_start",
    });
    chrome.tabs.get(tabId, details => {
        console.info(`Injected JS ${url} into ${details.url}.`);
    });
}

function injectCss(url, contents, tabId, frameId) {
    chrome.tabs.insertCSS(tabId, {
        code: contents,
        frameId: frameId,
        runAt: "document_start",
    });
    chrome.tabs.get(tabId, details => {
        console.info(`Injected CSS ${url} into ${details.url}.`);
    });
}
