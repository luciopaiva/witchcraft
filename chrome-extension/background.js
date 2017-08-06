"use strict";
// need to load background.js as persistent in manifest.json, otherwise it will be unloaded and these maps will be lost!

/**
 * Quick doc to help linters
 * @class chrome
 * @property runtime.onMessage.addListener
 * @property tabs.onActivated
 * @property browserAction.setBadgeText
 */

/**
 * // https://developer.chrome.com/extensions/tabs#type-Tab
 * @class Tab
 * @property {number} id
 */

/**
 * // https://developer.chrome.com/extensions/runtime#type-MessageSender
 * @class MessageSender
 * @property {Tab} tab
 * @property {number} frameId
 */


class WitchcraftBackgroundManager {

    constructor () {
        /** @type {Map<number, Set<string>>} map with number of scripts loaded per tab */
        this.scriptsLoadedByTabId = new Map();

        // listen for script/stylesheet requests
        chrome.runtime.onMessage.addListener(this.retrieveRelatedScriptsFromServer.bind(this));

        // listen for tab switches
        chrome.tabs.onActivated.addListener(
            /** @type {{tabId: number}} */ activeInfo => this.updateIconBadge(activeInfo.tabId));
    }

    createOrResetScriptsSetForTab(tabId) {
        let scripts = this.scriptsLoadedByTabId.get(tabId);
        if (!scripts) {
            scripts = new Set();
            this.scriptsLoadedByTabId.set(tabId, scripts);
        } else {
            scripts.clear();
        }
        return scripts;
    }

    /**
     * Ask the local server to retrieve all relevant scripts for this url.
     *
     * @param {{ type: string, hostname: string }} parameters - type is either 'css' or 'js' and hostname is the page's
     * @param {MessageSender} sender - the sender context of the foreground script
     * @param {Function} callback - will be called back with all scripts bundled into a single string
     */
    retrieveRelatedScriptsFromServer(parameters, sender, callback) {

        let scriptsSet = null;
        if (sender.frameId === 0) {
            // this is the top frame of the tab, so take the chance and reset the set of scripts for that tab
            scriptsSet = this.createOrResetScriptsSetForTab(sender.tab.id);
        } else {
            scriptsSet = this.scriptsLoadedByTabId.get(sender.tab.id);
        }

        const httpRequest = new XMLHttpRequest();

        httpRequest.addEventListener('readystatechange', () => {
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
                this.parseScriptResponse(
                    httpRequest.status, httpRequest.responseText, sender.tab.id, scriptsSet, callback);
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
     * @param {number} tabId - tab being updated
     * @param {Set<string>} scriptsSet - the set of scripts loaded by the current tab so far
     * @param {Function} callback - function to call back to send script to the foreground
     */
    parseScriptResponse(status, responseText, tabId, scriptsSet, callback) {
        let script = '';

        // if we did get valid content
        if (status === 200) {
            script = responseText;

            const scriptStartIndex = script.indexOf('\n\n');
            if (scriptStartIndex !== -1) {
                script.substring(0, scriptStartIndex).split('\n').forEach(scriptName => scriptsSet.add(scriptName));

                // skip script names before sending final result to the foreground
                script = script.substring(scriptStartIndex);
            }
        }

        // send the script to the foreground
        callback(script);

        console.info(`[${tabId}] scripts loaded so far: ${[...scriptsSet.keys()]}`);

        this.updateIconBadge(tabId);
    }

    /**
     * Update the icon badge with the number of scripts loaded by the currently active Chrome tab.
     *
     * @param {number} tabId - the id of the tab for which the badge should reflect the number of scripts loaded
     */
    updateIconBadge(tabId) {
        const scripts = this.scriptsLoadedByTabId.get(tabId);
        const countStr = scripts ? scripts.size.toString() : '';
        chrome.browserAction.setBadgeText({ text: countStr });
    }
}

new WitchcraftBackgroundManager();
