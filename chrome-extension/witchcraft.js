/*
    This is the background script, controlling all content scripts running on each tab. Since `manifest.json` is set to
    background-persistent mode, a single instance will run, guaranteed not to leave memory and thus keeping its state.
 */

// some declarations just to make linters stop complaining
/**
 * @class chrome
 * @property runtime.onMessage.addListener
 * @property chrome.extension.getURL
 * @property tabs.onActivated
 * @property tabs.sendMessage
 * @property browserAction.setBadgeText
 * @property chrome.browserAction.setIcon
 * @property chrome.browserAction.setTitle
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

    /**
     * chrome and document are being injected so they can be easily mocked in tests
     *
     * @param {chrome} chrome
     * @param {Document} document
     */
    constructor (chrome, document) {
        this.chrome = chrome;
        this.document = document;

        this.emptySet = new Set();

        this.serverPort = 5743;
        this.serverAddress = `http://127.0.0.1:${this.serverPort}/`;
        /** @type {Boolean} */
        this.isServerReachable = true;

        /** @type {Map<number, Set<string>>} map with set of scripts loaded per tab, with the sole purpose of keeping
         *                                   the badge in the UI up-to-date */
        this.scriptNamesByTabId = new Map();
        this.currentTabId = -1;

        this.iconSize = 16;

        if (this.document) {  // will be false during tests
            const iconCanvas = this.document.createElement("canvas");
            iconCanvas.width = this.iconSize;
            iconCanvas.height = this.iconSize;
            this.iconContext = iconCanvas.getContext("2d");

            this.iconImage = new Image();
            this.iconImage.src = this.chrome.extension.getURL("/witch-16.png");
        }

        // listen for script/stylesheet requests
        this.chrome.runtime.onMessage.addListener(this.onScriptRequest.bind(this));

        // listen for tab switches
        this.chrome.tabs.onActivated.addListener(
            /** @type {{tabId: number}} */ activeInfo => this.updateInterface(activeInfo.tabId));
    }

    /**
     * @param {MessageSender} sender - the sender context of the content script that called us
     */
    clearScriptsIfTopFrame(sender) {
        if (sender.frameId === 0) {
            // this is the top frame; assume the tab is being reloaded and take the chance to reset its counter
            const scripts = this.scriptNamesByTabId.get(sender.tab.id);
            if (scripts) {
                scripts.clear();
            }
        }
    }

    /**
     * @param {String} scriptFileName
     * @param {Number} tabId
     */
    registerScriptForTabId(scriptFileName, tabId) {
        let scripts = this.scriptNamesByTabId.get(tabId);
        if (!scripts) {
            scripts = new Set();
            this.scriptNamesByTabId.set(tabId, scripts);
        }
        scripts.add(scriptFileName);
    }

    /**
     * Receives a domain and yields it back in parts, progressively adding sub-levels starting from the TLD. For
     * instance, if the hostname is `"foo.bar.com"`, the resulting sequence will be `"com"`, `"bar.com"`,
     * `"foo.bar.com"`.
     *
     * @param {String} hostname
     * @returns {IterableIterator<String>}
     */
    static *iterateDomainLevels(hostname) {
        const parts = hostname.split(".");
        for (let i = parts.length - 1; i >= 0; i--) {
            yield parts.slice(i, parts.length).join(".");
        }
    }

    /**
     * @param {String} scriptFileName - the script file name to query for
     * @returns {Promise<String>} file contents or null if file does not exist
     */
    queryLocalServerForFile(scriptFileName) {
        const self = this;

        return new Promise(resolve => {
            const request = new XMLHttpRequest();
            request.addEventListener("load", function () {
                self.isServerReachable = true;

                if (this.status === 200) {
                    // script was found - return its contents
                    resolve(this.responseText);
                } else if (this.status === 404) {
                    resolve(null);
                } else {
                    // bad response - assume server is down
                    self.isServerReachable = false;
                    resolve(null);
                }
            });
            request.addEventListener("error", function () {
                // bad response - assume server is down
                self.isServerReachable = false;
                resolve(null);
            });
            request.open("GET", this.serverAddress + scriptFileName, true);
            request.send();
        });
    }

    /**
     * Ask the local server to retrieve all relevant scripts for this url.
     *
     * @param {String} hostName - the host name of the tab being loaded
     * @param {MessageSender} sender - the sender context of the content script that called us
     */
    async onScriptRequest(hostName, sender) {
        this.clearScriptsIfTopFrame(sender);

        await this.loadScript(Witchcraft.globalScriptName, "js", sender);
        await this.loadScript(Witchcraft.globalScriptName, "css", sender);

        for (const domain of Witchcraft.iterateDomainLevels(hostName)) {
            await this.loadScript(domain, "js", sender);
            await this.loadScript(domain, "css", sender);
        }

        this.updateInterface(sender.tab.id);
    }

    /**
     * @param {String} domain
     * @param {String} scriptType - either "js" or "css"
     * @param {MessageSender} sender - the sender context of the content script that called us
     * @returns {Promise<void>}
     */
    async loadScript(domain, scriptType, sender) {
        const scriptFileName = `${domain}.${scriptType}`;
        let scriptContents = await this.queryLocalServerForFile(scriptFileName);
        if (scriptContents) {
            scriptContents = await this.processIncludeDirectives(scriptContents, scriptFileName);
            this.chrome.tabs.sendMessage(sender.tab.id, {
                scriptType,
                scriptContents,
            }, {
                frameId: sender.frameId
            });
            this.registerScriptForTabId(scriptFileName, sender.tab.id);
        }
    }

    /**
     * Process `@include` directives, replacing them with the actual scripts they refer to. The processing is recursive,
     * i.e., included files also have their `@include` directives processed. The algorithm detects dependency cycles and
     * avoids them by not including any file more than once.
     *
     * @param {String} originalScript - raw script to be processed
     * @param {String} originalScriptFileName - name of the raw script
     * @return {Promise<String>} - processed script
     */
    async processIncludeDirectives(originalScript, originalScriptFileName) {
        const visitedScripts = new Set();
        visitedScripts.add(originalScriptFileName);

        let result;
        const includeDirective = /^[ \t]*\/\/[ \t]*@include[ \t]*(".*?"|\S+).*$/mg;
        // noinspection JSValidateTypes
        while ((result = includeDirective.exec(originalScript)) !== null) {
            const fullMatchStr = result[0];

            // determine full path to include file
            const scriptFileName = result[1].replace(/^"|"$/g, "");  // remove quotes, if any

            // the matched directive to be cut from the original file
            const endIndex = includeDirective.lastIndex;
            const startIndex = endIndex - fullMatchStr.length;

            // check for dependency cycles
            if (!visitedScripts.has(scriptFileName)) {
                const scriptContent = await this.queryLocalServerForFile(scriptFileName);
                if (scriptContent) {
                    originalScript = Witchcraft.spliceString(originalScript, startIndex, endIndex, scriptContent);
                    // put regex caret right where the appended file begins to recursively look for include directives
                    includeDirective.lastIndex = startIndex;
                    visitedScripts.add(scriptFileName);
                } else {
                    // script not found
                    originalScript = Witchcraft.spliceString(originalScript, endIndex, endIndex,
                        ` -- WITCHCRAFT: could not include "${scriptFileName}"; script was not found`);
                }
            } else {
                // this script was already included before
                originalScript = Witchcraft.spliceString(originalScript, endIndex, endIndex,
                    ` -- WITCHCRAFT: skipping inclusion of "${scriptFileName}" to avoid dependency cycle`);
            }
        }

        return originalScript;
    }

    /**
     * Splices a string. See https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
     * for more info.
     *
     * @param {String} str - string that is going to be spliced
     * @param {Number} startIndex - where to start the cut
     * @param {Number} endIndex - where to end the cut
     * @param {String} whatToReplaceWith - the substring that will replace the removed one
     * @return {String} the resulting string
     */
    static spliceString(str, startIndex, endIndex, whatToReplaceWith) {
        return str.substring(0, startIndex) + whatToReplaceWith + str.substring(endIndex);
    }

    /**
     * Redraws extension icon with loaded script count for current tab. Also shows a red exclamation mark if file server
     * is not reachable.
     *
     * Better than using chrome.browserAction.setBadgeText(). Not only text color is not configurable, it also restricts
     * font size, positioning, etc.
     *
     * @param {Number} count
     */
    updateIconWithScriptCount(count) {
        if (!this.iconContext) {
            return;  // will be undefined when running tests
        }

        this.iconContext.clearRect(0, 0, this.iconSize, this.iconSize);
        this.iconContext.drawImage(this.iconImage, 0, 0);

        this.iconContext.font = "9px arial";
        this.iconContext.textAlign = "right";
        this.iconContext.fillStyle = "#00FF00";
        this.iconContext.fillText(count.toString(), this.iconSize, this.iconSize);

        if (!this.isServerReachable) {
            this.iconContext.font = "bold 20px serif";
            this.iconContext.textAlign = "left";
            this.iconContext.fillStyle = "#FF0000";
            this.iconContext.fillText("!", 0, this.iconSize);
        }

        this.chrome.browserAction.setIcon({ imageData: this.iconContext.getImageData(0, 0, this.iconSize, this.iconSize) });
    }

    /**
     * Updates the icon badge and popup with information about scripts loaded by the currently active Chrome tab.
     *
     * @param {number} tabId - the id of the tab for which the badge should reflect the number of scripts loaded
     */
    updateInterface(tabId) {
        // this will be used by the popup when it's opened
        this.currentTabId = tabId;

        const scripts = this.scriptNamesByTabId.get(tabId);
        const count = scripts ? scripts.size : 0;

        this.updateIconWithScriptCount(count);

        const countStr = count.toString();
        const title = `Witchcraft (${count === 0 ? "no" : countStr} script${count === 1 ? "" : "s"} loaded)`;
        this.chrome.browserAction.setTitle({ title: title});
    }

    /**
     * Used by the popup window to show badge with count.
     *
     * @returns {Set<string>}
     */
    getCurrentTabScriptNames() {
        return this.getScriptNamesForTabId(this.currentTabId);
    }

    /**
     * Used by the popup window to construct URL's of loaded files.
     *
     * @returns {string}
     */
    getServerAddress() {
        return this.serverAddress;
    }

    /**
     * @param {Number} tabId
     * @returns {Set<String>}
     */
    getScriptNamesForTabId(tabId) {
        return this.scriptNamesByTabId.get(tabId) || this.emptySet;
    }

    static get globalScriptName() {
        return "_global";
    }
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = Witchcraft;  // used by Node.js when testing
}
