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
     * @param {Analytics} analytics
     */
    constructor (chrome, document, analytics) {
        this.chrome = chrome;
        this.document = document;
        this.analytics = analytics;

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

        // fetch is only undefined during tests
        this.fetch = typeof fetch === "undefined" ? (async () => {}) : fetch.bind(window);

        // either `// @include foo.js` or `/* @include foo.js */`
        this.includeDirectiveRegexJs = /^[ \t]*(?:\/\/|\/\*)[ \t]*@include[ \t]*(".*?"|[^*\s]+).*$/mg;
        // only `/* @include foo.js */` is acceptable
        this.includeDirectiveRegexCss = /^[ \t]*\/\*[ \t]*@include[ \t]*(".*?"|\S+)[ \t]*\*\/.*$/mg;

        // listen for script/stylesheet requests
        this.chrome.runtime.onMessage.addListener(this.onScriptRequest.bind(this));

        // listen for tab switches
        this.chrome.tabs.onActivated.addListener(
            /** @type {{tabId: number}} */ activeInfo => this.updateInterface(activeInfo.tabId));

        this.analytics && this.analytics.send("App", "Load");

        this.resetMetrics();
    }

    resetMetrics() {
        this.jsHitCount = 0;
        this.cssHitCount = 0;
        this.errorCount = 0;
        this.failCount = 0;
        this.jsIncludesHitCount = 0;
        this.cssIncludesHitCount = 0;
        this.jsIncludesErrorCount = 0;
        this.cssIncludesErrorCount = 0;
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
     * @param {String} scriptFileName - the script file name to query for
     * @returns {Promise<String>} file contents or null if file does not exist
     */
    async queryLocalServerForFile(scriptFileName) {
        try {
            const response = await this.fetch(this.serverAddress + scriptFileName);
            this.isServerReachable = true;

            if (response.status === 200) {
                scriptFileName.endsWith("js") ? this.jsHitCount++ : this.cssHitCount++;
                return await response.text();
            } else if (response.status === 404) {
                return null;
            } else {
                this.errorCount++;
                this.isServerReachable = false;
                return null;
            }
        } catch (e) {
            this.failCount++;
            this.isServerReachable = false;
            return null;
        }
    }

    /**
     * Ask the local server to retrieve all relevant scripts for this url.
     *
     * @param {Location} location - the Location object of the tab being loaded
     * @param {MessageSender} sender - the sender context of the content script that called us
     */
    async onScriptRequest(location, sender) {
        this.clearScriptsIfTopFrame(sender);
        this.resetMetrics();

        await this.loadScript(Witchcraft.globalScriptName, Witchcraft.EXT_JS, sender);
        await this.loadScript(Witchcraft.globalScriptName, Witchcraft.EXT_CSS, sender);

        for (const domain of Witchcraft.iterateDomainLevels(location.hostname)) {
            await this.loadScript(domain, Witchcraft.EXT_JS, sender);
            await this.loadScript(domain, Witchcraft.EXT_CSS, sender);
        }

        for (const segment of Witchcraft.iteratePathSegments(location.pathname)) {
            await this.loadScript(location.hostname + segment, Witchcraft.EXT_JS, sender);
            await this.loadScript(location.hostname + segment, Witchcraft.EXT_CSS, sender);
        }

        this.updateInterface(sender.tab.id);
        this.sendMetrics();
    }

    sendMetrics() {
        if (this.analytics) {
            if (this.jsHitCount > 0) {
                this.analytics.send("Scripts", "JS hits", undefined, this.jsHitCount);
            }
            if (this.cssHitCount > 0) {
                this.analytics.send("Scripts", "CSS hits", undefined, this.cssHitCount);
            }
            if (this.errorCount > 0) {
                this.analytics.send("Scripts", "Errors", undefined, this.errorCount);
            }
            if (this.failCount > 0) {
                this.analytics.send("Scripts", "Server failures", undefined, this.failCount);
            }
            if (this.jsIncludesHitCount > 0) {
                this.analytics.send("Scripts", "JS include hits", undefined, this.jsIncludesHitCount);
            }
            if (this.cssIncludesHitCount > 0) {
                this.analytics.send("Scripts", "CSS include hits", undefined, this.cssIncludesHitCount);
            }
            if (this.jsIncludesErrorCount > 0) {
                this.analytics.send("Scripts", "JS include errors", undefined, this.jsIncludesErrorCount);
            }
            if (this.cssIncludesErrorCount > 0) {
                this.analytics.send("Scripts", "CSS include errors", undefined, this.cssIncludesErrorCount);
            }
        }
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
     * Receives a path and yields it back in parts, progressively adding directories starting from the base one. For
     * instance, if the path is `"/foo/bar/index.html"`, the resulting sequence will be `"/foo"`, `"/foo/bar"`,
     * `"/foo/bar/index.html"`.
     *
     * @param {String} pathName
     * @return {IterableIterator<String>}
     */
    static *iteratePathSegments(pathName = "/") {
        if (!pathName || pathName.length < 2) {
            return undefined;
        }
        let beginAt = 1;  // we don't want to match the leading slash alone
        let result = pathName.indexOf("/", beginAt);
        while ((result = pathName.indexOf("/", beginAt)) !== -1) {
            yield pathName.substring(0, result);
            beginAt = result + 1;
        }
        yield pathName.substring(0, pathName.length);
    }

    /**
     * @param {String} domain
     * @param {String} scriptType - either Witchcraft.EXT_JS or Witchcraft.EXT_CSS
     * @param {MessageSender} sender - the sender context of the content script that called us
     * @returns {Promise<void>}
     */
    async loadScript(domain, scriptType, sender) {
        const scriptFileName = `${domain}.${scriptType}`;
        let scriptContents = await this.queryLocalServerForFile(scriptFileName);
        if (scriptContents) {
            scriptContents = await this.processIncludeDirectives(scriptContents, scriptFileName, scriptType);
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
     * @param {String} scriptType - either JavaScript or CSS
     * @param {Set<String>} visitedScripts
     * @return {Promise<String>} - processed script
     */
    async processIncludeDirectives(originalScript, originalScriptFileName, scriptType,
                                   visitedScripts = new Set()) {
        visitedScripts.add(originalScriptFileName);

        /** @type {Array<{ startIndex: Number, endIndex: Number, scriptContent: String}>} */
        const directives = [];

        for (const [scriptFileName, startIndex, endIndex] of this.findIncludedScriptNames(originalScript, scriptType)) {
            // check for dependency cycles
            if (!visitedScripts.has(scriptFileName)) {
                let scriptContent = await this.queryLocalServerForFile(scriptFileName);
                if (scriptContent) {
                    // expand it recursively
                    const expandedScript =
                        await this.processIncludeDirectives(scriptContent, scriptFileName, scriptType, visitedScripts);
                    directives.push({ startIndex, endIndex, scriptContent: expandedScript });

                    if (scriptFileName.endsWith("js")) {
                        this.jsIncludesHitCount++;
                    } else if (scriptFileName.endsWith("css")) {
                        this.cssIncludesHitCount++;
                    }
                } else {
                    // script not found
                    directives.push({ startIndex, endIndex, scriptContent:
                            `/* WITCHCRAFT: could not include "${scriptFileName}"; script was not found */`});

                    if (scriptFileName.endsWith("js")) {
                        this.jsIncludesErrorCount++;
                    } else if (scriptFileName.endsWith("css")) {
                        this.cssIncludesErrorCount++;
                    }
                }
            } else {
                // this script was already included before
                directives.push({ startIndex, endIndex, scriptContent:
                        `/* WITCHCRAFT: skipping inclusion of "${scriptFileName}" due to dependency cycle */`});
            }
        }

        let expandedScript = originalScript;
        let delta = 0;
        for (const directive of directives) {
            expandedScript = Witchcraft.spliceString(expandedScript, directive.startIndex + delta,
                directive.endIndex + delta, directive.scriptContent);
            delta += directive.scriptContent.length;
        }

        return expandedScript;
    }

    /**
     * @param {String} script
     * @param {String} scriptType
     * @return {Generator<[String, Number, Number]>}
     */
    *findIncludedScriptNames(script, scriptType) {
        const includeDirective = scriptType === Witchcraft.EXT_CSS ?
            this.includeDirectiveRegexCss : this.includeDirectiveRegexJs;

        // important to reset the regex cursor before starting
        includeDirective.lastIndex = 0;

        let result;

        while ((result = includeDirective.exec(script)) !== null) {
            const fullMatchStr = result[0];

            const endIndex = includeDirective.lastIndex;
            const startIndex = endIndex - fullMatchStr.length;

            // determine full path to include file
            const scriptFileName = result[1].replace(/^"|"$/g, "");  // remove quotes, if any
            yield [scriptFileName, startIndex, endIndex];

            // needed because lastIndex may have been changed outside after the yield above
            includeDirective.lastIndex = endIndex;
        }
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

    static get EXT_JS() { return "js" }
    static get EXT_CSS() { return "css" }
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = Witchcraft;  // used by Node.js when testing
}
