"use strict";

// need to load background.js as persistent in manifest.json, otherwise it will be unloaded and these maps will be lost!

/** @type {Map<number, number>} map with number of scripts loaded per tab */
const scriptsLoadedByTabId = new Map();
/** @type {Map<number, number>} map with number of stylesheets loaded per tab */
const stylesLoadedByTabId = new Map();

/**
 * Ask the local server to retrieve all relevant scripts for this url.
 *
 * @param {{ type: string, hostname: string }} parameters - type is either 'css' or 'js' and hostname is the page's
 * @param {Object} sender - not used
 * @param {Function} callback - will be called back with all scripts bundled into a single string
 */
function retrieveRelatedScriptsFromServer(parameters, sender, callback) {
    const httpRequest = new XMLHttpRequest();

    httpRequest.addEventListener('readystatechange', () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            parseScriptResponse(httpRequest.status, httpRequest.responseText, parameters, sender, callback);
        }
    });

    const SVR_PROTOCOL = 'http';
    const SVR_HOSTNAME = 'localhost';
    const SVR_PORT = 3131;

    // composes a request to our local server (e.g.: http://localhost:3131/css/github.com)
    const requestUrl = `${SVR_PROTOCOL}://${SVR_HOSTNAME}:${SVR_PORT}/${parameters.type}/${parameters.hostname}`;

    httpRequest.open('GET', requestUrl);
    httpRequest.send();

    return true;  // must return true to indicate to our peer that it should keep listening for an asynchronous response
                  // thanks to https://stackoverflow.com/a/20077854/778272
}

/**
 * Process incoming server response with scripts to inject in the foreground.
 *
 * @param {number} status - 200 if response is good; something else otherwise
 * @param {string} responseText - the contents returned by the local server
 * @param {{ type: string, hostname: string }} parameters - the parameters passed by the foreground script
 * @param {{ tab: {id: number} }} sender - the sender context of the foreground script
 * @param {Function} callback - function to call back to send script to the foreground
 */
function parseScriptResponse(status, responseText, parameters, sender, callback) {
    let script = '';
    let scriptCount = 0;

    // if we did get valid content
    if (status === 200) {
        script = responseText;

        // retrieve from the response the number of scripts found
        const re = /^(\d+)/g;  // global flag so we have access to lastIndex after the match
        const scriptCountMatch = re.exec(script);
        if (scriptCountMatch) {
            scriptCount = parseInt(scriptCountMatch[1], 10);
            script = script.substring(re.lastIndex);  // remove scripts count from final script
        }
    }

    // send the script to the foreground
    callback(script);

    const tabId = sender.tab.id;

    if (parameters.type === 'js') {
        scriptsLoadedByTabId.set(tabId, scriptCount);
    } else if (parameters.type === 'css') {
        stylesLoadedByTabId.set(tabId, scriptCount);
    }

    updateIconBadge(tabId);
}

/**
 * Update the icon badge with the number of scripts loaded by the currently active Chrome tab.
 *
 * @param {number} tabId - the id of the tab for which the badge should reflect the number of scripts loaded
 */
function updateIconBadge(tabId) {
    const scriptsCount = scriptsLoadedByTabId.get(tabId) || 0;
    const stylesCount = stylesLoadedByTabId.get(tabId) || 0;
    const totalCount = scriptsCount + stylesCount;
    chrome.browserAction.setBadgeText({text: totalCount > 0 ? totalCount.toString() : ''});
}

// listen for script/stylesheet requests
chrome.runtime.onMessage.addListener(retrieveRelatedScriptsFromServer);

// listen for tab switches
chrome.tabs.onActivated.addListener(activeInfo => updateIconBadge(activeInfo.tabId));
