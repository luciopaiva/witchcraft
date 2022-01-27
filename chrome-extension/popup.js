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

  constructor(){
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
    this.makeGenerateDirectiveAndShow();
  }

  showVersion(){
    document.getElementById("version").innerText = chrome.runtime.getManifest().version;
  }

  makeButtonFromAnchor(id, pageName = id){
    const anchor = typeof id === "string" ? document.getElementById(id) : id;
    anchor.addEventListener("click", () => {
      chrome.tabs.create({ url : anchor.getAttribute("href") });
      this.analytics.pageView("/popup/" + pageName);
      return false;
    });
  }

  showServerStatus(){
    document.getElementById("server-status")
      .classList.toggle("offline", !this.witchcraft.isServerReachable);
  }

  /** @return {void} */
  async renderScriptsTable(){
    const scriptsTable = document.getElementById("scripts-table");
    const noScriptsElement = document.getElementById("no-scripts");

    const currentTabId = await this.getCurrentTabId();
    const scriptNames = this.witchcraft.getScriptNamesForTab(currentTabId);

    const serverAddress = this.witchcraft.getServerAddress();

    const hasScripts = scriptNames && scriptNames.size > 0;
    noScriptsElement.classList.toggle("hidden", hasScripts);
    scriptsTable.classList.toggle("hidden", !hasScripts);

    if ( hasScripts ){
      for ( const scriptName of scriptNames ){
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
        if ( extensionMatch ){
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

  async getCurrentTabId(){
    return new Promise(resolve => {
      chrome.tabs.query({ active : true, currentWindow : true }, tabs => {
        if ( Array.isArray(tabs) && tabs.length > 0 ){
          resolve(tabs[0].id);
        } else {
          resolve(undefined);
        }
      });
    });
  }

  makeAdvancedPanel(){
    const serverAddressInput = document.getElementById("server-address");
    serverAddressInput.value = this.witchcraft.getServerAddress();
    serverAddressInput.addEventListener("input", event => {
      this.witchcraft.setServerAddress(event.target.value);
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

  convertStringToRegex(source, flags){
    let regex;
    try {
      regex = new RegExp(source, flags);
      regex = [ regex.source, regex.flags ];
    } catch ( e ){
      regex = []
    }
    return regex;
  }

  transformFileName(name){
    let file;
    try {
      let serverAddress = this.witchcraft.getServerAddress();
      if( !/[.](js|css)$/i.test(name) ){
        file = null
      } else {
        file = encodeURIComponent(name.replace(serverAddress, ''));
      }
    } catch ( e ){
      file = null;
    }
    return file;
  }

  generateDirective({ directiveHint, directiveInputRegex0, directiveInputRegex1, directiveInputFile }){

    let siteRegex = this.convertStringToRegex(directiveInputRegex0.value, directiveInputRegex1.value);
    let file = this.transformFileName(directiveInputFile.value);
    if ( file !== null && siteRegex.length ){
      directiveHint.classList.remove('invalid');
      const rule = { file, siteRegex };
      try {
        directiveHint.value = `//@include ${JSON.stringify(rule)}`;
      } catch ( e ){
        directiveHint.classList.add('invalid');
        directiveHint.placeholder = 'error with JSON parsing'
      }
    } else {
      //error
      directiveHint.placeholder = 'error with file or site conversion'
      directiveHint.classList.add('invalid');

    }
  }

  makeGenerateDirectiveAndShow(){
    const directiveInputFile = document.getElementById('directive-file');
    const directiveInputRegex0 = document.getElementById('directive-regexsource');
    const directiveInputRegex1 = document.getElementById('directive-regexflags');
    const copyButton = document.getElementById('directive-copy');
    const directiveHint = document.getElementById('directive-hint');

    copyButton.addEventListener('click', () => {
      navigator.clipboard.writeText(directiveHint.value);
    });
    directiveInputFile.addEventListener('keyup', () => {
      this.generateDirective({ directiveHint, directiveInputRegex0, directiveInputRegex1, directiveInputFile })
    });
    directiveInputRegex0.addEventListener('keyup', () => {
      this.generateDirective({ directiveHint, directiveInputRegex0, directiveInputRegex1, directiveInputFile })
    });

    directiveInputRegex1.addEventListener('keyup', () => {
      this.generateDirective({ directiveHint, directiveInputRegex0, directiveInputRegex1, directiveInputFile })
    });

  }
}

// this script will run every time the popup is shown (i.e., every time the user clicks on the extension icon)
// it reads information from the background window and shows it to the user
window.addEventListener("load", () => new Popup());
