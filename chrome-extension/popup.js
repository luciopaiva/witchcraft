
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

(function populatePopup() {
    // this script will run every time the popup is shown (i.e., every time the user clicks on the extension icon)
    // it reads information from the background window and shows to the user

    const background = chrome.extension.getBackgroundPage();

    /** @type {Witchcraft} */
    const witchcraft = background.window.witchcraft;

    const scriptsTable = document.getElementById("scripts-table");
    const noScriptsElement = document.getElementById("no-scripts");

    const scriptNames = witchcraft.getCurrentTabScriptNames();

    const serverAddress = witchcraft.getServerAddress();

    if (scriptNames && scriptNames.size > 0) {
        noScriptsElement.classList.add("hidden");
        scriptsTable.classList.remove("hidden");

        for (const scriptName of scriptNames) {

            const tdName = document.createElement("td");
            const aName = document.createElement("a");
            tdName.appendChild(aName)
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
    } else {
        noScriptsElement.classList.remove("hidden");
        scriptsTable.classList.add("hidden");
    }

    document.getElementById("server-status").classList.toggle("offline", !witchcraft.isServerReachable);
})();
