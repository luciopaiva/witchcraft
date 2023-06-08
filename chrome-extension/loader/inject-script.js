import {EXT_CSS, EXT_JS} from "../path/map-to-js-and-css.js";
import {browser} from "../browser/index.js";
import {util} from "../util/index.js";

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
    browser.api.injectJs(util.embedScript(contents), tabId, frameId);
    logInjection(tabId, "JS", url);
}

function injectCss(url, contents, tabId, frameId) {
    browser.api.injectCss(contents, tabId, frameId);
    logInjection(tabId, "CSS", url);
}

function logInjection(tabId, type, scriptUrl) {
    browser.api.getTabUrl(tabId).then(tabUrl => {
        console.info(`Injected ${type} ${scriptUrl} into ${tabUrl}`);
    });
}
