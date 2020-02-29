
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
        const background = chrome.extension.getBackgroundPage();

        this.fullUrlRegex = /^https?:\/\//;

        /** @type {Witchcraft} */
        this.witchcraft = background.window.witchcraft;
        /** @type {Analytics} */
        this.analytics = background.window.analytics;
        this.analytics.pageView("/popup");

        this.makeButtonFromAnchor("docs");
        this.makeButtonFromAnchor("report-issue");
        this.showVersion();
        this.showServerStatus();
        this.renderScriptsTable();
        this.makeAdvancedPanel();
    }

    showVersion() {
        document.getElementById("version").innerText = chrome.runtime.getManifest().version;
    }

    makeButtonFromAnchor(id, pageName = id) {
        const anchor = typeof id === "string" ? document.getElementById(id) : id;
        anchor.addEventListener("click", () => {
            chrome.tabs.create({ url: anchor.getAttribute("href") });
            this.analytics.pageView("/popup/" + pageName);
            return false;
        });
    }

    showServerStatus() {
        document.getElementById("server-status")
            .classList.toggle("offline", !this.witchcraft.isServerReachable);
    }

    renderScriptsTable() {
        const scriptsTable = document.getElementById("scripts-table");
        const noScriptsElement = document.getElementById("no-scripts");

        const scriptNames = this.witchcraft.getCurrentTabScriptNames();

        const serverAddress = this.witchcraft.getServerAddress();

        const hasScripts = scriptNames && scriptNames.size > 0;
        noScriptsElement.classList.toggle("hidden", hasScripts);
        scriptsTable.classList.toggle("hidden", !hasScripts);

        if (hasScripts) {
            for (const scriptName of scriptNames) {
                const fileName = scriptName.substr(scriptName.lastIndexOf("/") + 1);
                const fullUrl = this.fullUrlRegex.test(scriptName) ? scriptName : serverAddress + scriptName;

                const tdName = document.createElement("td");
                tdName.classList.add("script-name");
                const aName = document.createElement("a");
                tdName.appendChild(aName);
                aName.target = "_blank";
                aName.innerText = fileName;
                aName.href = fullUrl;
                aName.setAttribute("title", aName.href);
                this.makeButtonFromAnchor(aName, "script");

                const tdType = document.createElement("td");
                const extensionMatch = scriptName.match(/\.([^.]+)$/);
                if (extensionMatch) {
                    const extension = extensionMatch[1];
                    tdType.classList.add(extension.toLowerCase());
                    tdType.innerText = extension.toUpperCase();
                } else {
                    tdType.innerText = "?";
                }

                const tr = document.createElement("tr");
                tr.appendChild(tdName);
                tr.appendChild(tdType);
                scriptsTable.appendChild(tr);
            }
        }
    }

    makeAdvancedPanel() {
        const openButton = document.getElementById("advanced");
        const panel = document.getElementById("advanced-panel");

        const serverAddressInput = document.getElementById("server-address");
        serverAddressInput.value = this.witchcraft.getServerAddress();
        serverAddressInput.addEventListener("input", event => {
            this.witchcraft.setServerAddress(event.target.value);
        });

        this.isAdvancedPanelVisible = false;

        openButton.addEventListener("click", event => {
            this.isAdvancedPanelVisible = !this.isAdvancedPanelVisible;
            panel.classList.toggle("hidden", !this.isAdvancedPanelVisible);
            event.preventDefault();
            return false;
        });

        const resetButton = document.getElementById("server-address-reset");
        resetButton.addEventListener("click", event => {
            console.info(this.witchcraft.defaultServerAddress);
            this.witchcraft.setServerAddress(this.witchcraft.defaultServerAddress);
            serverAddressInput.value = this.witchcraft.getServerAddress();
            event.preventDefault();
            return false;
        });
    }
}

// this script will run every time the popup is shown (i.e., every time the user clicks on the extension icon)
// it reads information from the background window and shows it to the user
window.addEventListener("load", () => new Popup());
