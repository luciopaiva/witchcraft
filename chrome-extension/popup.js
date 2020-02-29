
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

        /** @type {Witchcraft} */
        this.witchcraft = background.window.witchcraft;
        /** @type {Analytics} */
        this.analytics = background.window.analytics;
        this.analytics.pageView("/popup");

        this.makeButton("docs");
        this.makeButton("report-issue");
        this.showVersion();
        this.showServerStatus();
        this.renderScriptsTable();
    }

    showVersion() {
        document.getElementById("version").innerText = chrome.runtime.getManifest().version;
    }

    makeButton(id) {
        const link = document.getElementById(id);
        link.addEventListener("click", () => {
            chrome.tabs.create({ url: link.getAttribute("href") });
            this.analytics.pageView("/popup/" + id);
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

                const tdName = document.createElement("td");
                const aName = document.createElement("a");
                tdName.appendChild(aName);
                aName.target = "_blank";
                aName.innerText = scriptName;
                aName.href = serverAddress + scriptName;

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
}

// this script will run every time the popup is shown (i.e., every time the user clicks on the extension icon)
// it reads information from the background window and shows it to the user
window.addEventListener("load", () => new Popup());
