import {browser} from "../browser/index.js";
import {storage} from "../storage/index.js";
import {DEFAULT_SERVER_ADDRESS} from "../constants.js";
import Debouncer from "../util/debouncer.js";
import {analytics} from "../analytics/index.js";

class Popup {

    currentTabId = 0;

    constructor () {
        this.start().then();
    }

    async start() {
        this.currentTabId = await this.getActiveTabId();

        analytics.page("/popup", "popup");

        this.makeButtonFromAnchor("docs");
        this.makeButtonFromAnchor("report-issue");
        this.showVersion();
        await this.showServerStatus();
        await this.renderScripts();
        await this.makeAdvancedPanel();
        this.listenToStorageChanges();
    }

    listenToStorageChanges() {
        const scriptsDebouncer = new Debouncer(100);
        const callback = (changes, area) => {
            console.info("Storage changed in area", area, "changes:", changes);

            const keys = Object.keys(changes);
            if (!keys.some(key => key.startsWith(`frame-scripts:${this.currentTabId}:`))) {
                // not relevant to current tab
                return;
            }

            scriptsDebouncer.debounce(() => this.renderScripts());
        }
        const removeListener = browser.onStorageChanged(callback);
        // otherwise we'll have a registered listener for every time the popup opened:
        window.addEventListener("beforeunload", removeListener);
    }

    showVersion() {
        document.getElementById("version").innerText = browser.getAppVersion();
    }

    makeButtonFromAnchor(id) {
        const anchor = typeof id === "string" ? document.getElementById(id) : id;
        anchor.addEventListener("click", async () => {
            await browser.createTab(anchor.getAttribute("href"));
            analytics.page("/popup/" + id, id);
            return false;
        });
    }

    async showServerStatus() {
        document.getElementById("server-status")
            .classList.toggle("online", await storage.retrieveServerStatus());
    }

    /** @return {void} */
    async renderScripts() {
        const scriptsTable = document.getElementById("scripts-table");
        scriptsTable.innerHTML = "";
        const noScriptsElement = document.getElementById("no-scripts");

        const serverAddress = await storage.retrieveServerAddress();

        let gotAnyScripts = false;

        const frames = await storage.retrieveAllFrames(this.currentTabId);

        for (const [,frameInfo] of Object.entries(frames)) {
            const frameId = frameInfo?.frameId;
            if (typeof frameId !== "number") {
                continue;
            }

            const scriptNames = frameInfo?.scriptNames ?? [];

            if (scriptNames.length > 0) {
                const frameRow = this.renderFrame(frameId);
                scriptsTable.appendChild(frameRow);
            }

            for (const scriptName of scriptNames) {
                const row = this.renderScript(scriptName, serverAddress);
                scriptsTable.appendChild(row);
                gotAnyScripts = true;
            }
        }

        noScriptsElement.classList.toggle("hidden", gotAnyScripts);
        scriptsTable.classList.toggle("hidden", !gotAnyScripts);
    }

    async getActiveTabId() {
        // first try to get tab ID from query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const activeTabId = urlParams.get('activeTabId');

        if (activeTabId !== null) {
            // parse to integer if it's a valid number
            const parsedId = parseInt(activeTabId, 10);
            if (!isNaN(parsedId)) {
                return parsedId;
            }
        }

        // fall back to browser API if no valid query parameter found
        return await browser.getActiveTabId();
    }

    renderFrame(frameId) {
        const tr = document.createElement("tr");
        tr.classList.add("page-frame")
        const td = document.createElement("td");
        td.setAttribute("colspan", "2");
        td.innerText = frameId === 0 ? "Top frame" : `Frame ${frameId}`;
        tr.appendChild(td);
        return tr;
    }

    renderScript(scriptName, serverAddress) {
        const tdName = this.renderScriptName(scriptName, serverAddress);
        const tdType = this.renderScriptType(scriptName);

        const tr = document.createElement("tr");
        tr.appendChild(tdName);
        tr.appendChild(tdType);
        return tr;
    }

    renderScriptName(scriptName, serverAddress) {
        const fileName = scriptName;
        const fullUrl = `${serverAddress}/${scriptName}`;

        const tdName = document.createElement("td");
        tdName.classList.add("script-name");
        const aName = document.createElement("a");
        tdName.appendChild(aName);
        aName.target = "_blank";
        aName.innerText = fileName;
        aName.href = fullUrl;
        aName.setAttribute("title", aName.href);
        this.makeButtonFromAnchor(aName, "script");
        return tdName;
    }

    renderScriptType(scriptName) {
        const tdType = document.createElement("td");
        tdType.classList.add("script-type");
        const badge = document.createElement("div");

        const extensionMatch = scriptName.match(/\.([^.]+)$/);
        if (extensionMatch) {
            const extension = extensionMatch[1];
            badge.classList.add(extension.toLowerCase());
            badge.innerText = extension.toUpperCase();
        } else {
            badge.innerText = "?";
        }
        tdType.appendChild(badge);
        return tdType;
    }

    /** @return {void} */
    async makeAdvancedPanel() {
        async function readServerAddress() {
            const serverAddressInput = document.getElementById("server-address");
            serverAddressInput.value = await storage.retrieveServerAddress();
            serverAddressInput.addEventListener("input", async event => {
                await browser.storeKey("server-address", event.target.value);
            });
        }

        await readServerAddress();

        const resetButton = document.getElementById("server-address-reset");
        resetButton.addEventListener("click", async event => {
            await browser.storeKey("server-address", DEFAULT_SERVER_ADDRESS);
            await readServerAddress();
            event.preventDefault();
            return false;
        });
    }
}

new Popup();
