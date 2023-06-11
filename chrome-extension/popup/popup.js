
import {browser} from "../browser/index.js";
import {storage} from "../storage/index.js";
import {DEFAULT_SERVER_ADDRESS} from "../constants.js";

// some declarations just to make linters stop complaining
/**
 * @class chrome
 * @property extension.getBackgroundPage
 * @property chrome.extension.getURL
 * @property tabs.onActivated
 * @property tabs.sendMessage
 * @property browserAction.setBadgeText
 * @property chrome.browserAction.setIcon
 * @property chrome.browserAction.setTitle
 */

class Popup {

    constructor () {
        // const background = chrome.extension.getBackgroundPage();

        // this.fullUrlRegex = /^https?:\/\//;

        /** @type {Witchcraft} */
        // this.witchcraft = background.window.witchcraft;
        /** @type {Analytics} */
        // this.analytics = background.window.analytics;
        // this.analytics.pageView("/popup");

        this.makeButtonFromAnchor("docs");
        this.makeButtonFromAnchor("report-issue");
        this.showVersion();
        this.showServerStatus();
        this.renderScriptsTable();
        this.makeAdvancedPanel();
    }

    showVersion() {
        document.getElementById("version").innerText = browser.api.getManifestVersion();
    }

    makeButtonFromAnchor(id, pageName = id) {
        const anchor = typeof id === "string" ? document.getElementById(id) : id;
        anchor.addEventListener("click", async () => {
            await browser.api.createTab(anchor.getAttribute("href"));
            // this.analytics.pageView("/popup/" + pageName);
            return false;
        });
    }

    showServerStatus() {
        document.getElementById("server-status")
            // .classList.toggle("offline", !this.witchcraft.isServerReachable);
            .classList.toggle("offline", false);
    }

    /** @return {void} */
    async renderScriptsTable() {
        const scriptsTable = document.getElementById("scripts-table");
        scriptsTable.innerHTML = "";
        const noScriptsElement = document.getElementById("no-scripts");

        const serverAddress = await browser.api.retrieveKey("server-address");

        let gotAnyScripts = false;
        const currentTabId = await browser.api.getActiveTabId();
        for (const frameId of await browser.api.getAllFrames(currentTabId)) {
            const frameInfo = await storage.retrieveFrame(currentTabId, frameId);
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

    async makeAdvancedPanel() {
        async function readServerAddress() {
            const serverAddressInput = document.getElementById("server-address");
            serverAddressInput.value = await browser.api.retrieveKey("server-address");
            serverAddressInput.addEventListener("input", async event => {
                await browser.api.storeKey("server-address", event.target.value);
            });
        }

        await readServerAddress();

        const resetButton = document.getElementById("server-address-reset");
        resetButton.addEventListener("click", async event => {
            await browser.api.storeKey("server-address", DEFAULT_SERVER_ADDRESS);
            await readServerAddress();
            event.preventDefault();
            return false;
        });
    }
}

// this script will run every time the popup is shown (i.e., every time the user clicks on the extension icon)
// it reads information from the background window and shows it to the user
window.addEventListener("load", () => new Popup());

// chrome.storage.onChanged.addListener((changes, namespace) => {
//     for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
//         console.log(
//             `Storage key "${key}" in namespace "${namespace}" changed.`,
//             `Old value was "${oldValue}", new value is "${newValue}".`
//         );
//     }
// });
