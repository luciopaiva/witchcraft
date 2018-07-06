/*
    This is the background script, controlling all content scripts running on each tab. Since `manifest.json` is set to
    background-persistent mode, a single instance will run, guaranteed not to leave memory and thus keeping its state.
 */

// some declarations just to make linters stop complaining
/**
 * @class chrome
 * @property runtime.onMessage.addListener
 * @property runtime.getURL
 * @property tabs.onActivated
 * @property tabs.sendMessage
 * @property browserAction.setBadgeText
 */
/**
 * // https://developer.chrome.com/extensions/tabs#type-Tab
 * @class Tab
 * @property {Number} id
 */
/**
 * // https://developer.chrome.com/extensions/runtime#type-MessageSender
 * @class MessageSender
 * @property {Tab} tab
 * @property {Number} frameId
 */

class Witchcraft {

    static get PATH_TO_SCRIPTS() { return "scripts/"; }

    constructor () {
        /** @type {Map<number, Set<string>>} map with number of scripts loaded per tab, with the sole purpose of keeping
         *                                   the badge in the UI up-to-date */
        this.scriptsLoadedByTabId = new Map();

        // listen for script/stylesheet requests
        chrome.runtime.onMessage.addListener(this.retrieveRelevantScripts.bind(this));

        // listen for tab switches
        chrome.tabs.onActivated.addListener(
            /** @type {{tabId: number}} */ activeInfo => this.updateIconBadge(activeInfo.tabId));
    }

    /**
     * @param {MessageSender} sender - the sender context of the content script that called us
     * @returns {Set<String>}
     */
    obtainScriptsSetForSender(sender) {
        let scripts = this.scriptsLoadedByTabId.get(sender.tab.id);
        if (!scripts) {
            scripts = new Set();
            this.scriptsLoadedByTabId.set(sender.tab.id, scripts);
        }

        if (sender.frameId === 0) {
            // this is the top frame; assume the tab is being reloaded and take the chance to reset its counter
            scripts.clear();
        }

        return scripts;
    }

    /**
     * Receives a domain and yields it back in parts, progressively adding sub-levels starting from the TLD. For
     * instance, if the hostname is `"foo.bar.com"`, the resulting sequence will be `'com'`, `'bar.com'`,
     * `'foo.bar.com'`.
     *
     * @param {String} hostname
     * @returns {IterableIterator<String>}
     */
    static *iterateDomainLevels(hostname) {
        const parts = hostname.split('.');
        for (let i = parts.length - 1; i >= 0; i--) {
            yield parts.slice(i, parts.length).join('.');
        }
    }

    /**
     * @param {String} scriptFileName - the file inside the extension folder to load
     * @returns {Promise<String>} file contents or null if file does not exist
     */
    static getFileFromExtensionFolder(scriptFileName) {
        return new Promise(resolve => {
            const request = new XMLHttpRequest();
            request.addEventListener("load", function () {
                // script was found - return its contents
                resolve(this.responseText);
            });
            request.addEventListener("error", function () {
                // scripts does not exit
                resolve(null);
            });
            const extensionUrl = chrome.runtime.getURL(Witchcraft.PATH_TO_SCRIPTS + scriptFileName);
            request.open("GET", extensionUrl, true);
            request.send();
        });
    }

    /**
     * Ask the local server to retrieve all relevant scripts for this url.
     *
     * @param {String} hostName - the host name of the tab being loaded
     * @param {MessageSender} sender - the sender context of the content script that called us
     */
    async retrieveRelevantScripts(hostName, sender) {
        const scriptsSet = this.obtainScriptsSetForSender(sender);

        for (const domain of Witchcraft.iterateDomainLevels(hostName)) {
            await Witchcraft.handleScriptLoading(domain, "js", scriptsSet, sender);
            await Witchcraft.handleScriptLoading(domain, "css", scriptsSet, sender);
        }

        this.updateIconBadge(sender.tab.id);
    }

    /**
     * @param {String} domain
     * @param {String} scriptType - either "js" or "css"
     * @param {Set<String>} scriptsSet - set of scripts to update if this script is successfully loaded
     * @param {MessageSender} sender - the sender context of the content script that called us
     * @returns {Promise<void>}
     */
    static async handleScriptLoading(domain, scriptType, scriptsSet, sender) {
        const scriptFileName = `${domain}.${scriptType}`;
        const scriptContents = await Witchcraft.getFileFromExtensionFolder(scriptFileName);
        if (scriptContents) {
            chrome.tabs.sendMessage(sender.tab.id, {
                scriptType,
                scriptContents,
            }, {
                frameId: sender.frameId
            });
            scriptsSet.add(scriptFileName);
        }
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

new Witchcraft();
