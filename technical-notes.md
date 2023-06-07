
# Technical notes

## Initial architecture

Up until Witchcraft v2, the architecture was composed of a background script, a content script and the popup window. The content script was injected in every frame of every tab via the following configuration in the manifest file:

    "content_scripts": [{
        "all_frames": true,
        "run_at":     "document_start",
        "matches":    ["http://*/*", "https://*/*"],
        "js":         ["content-script.js"]
    }],

As soon as it ran, it would send a message to the background script via `chrome.runtime.sendMessage(location)`. This would trigger the logic that generated the list of potential scripts and then tried fetching them from the HTTP server. The background script is necessary because the content script is very limited in what it can do.

The background script would finally send the loaded script as text to the content script, which would then run it like so:

    Function(scriptContents)();

Which is effectively doing an `eval()` on the loaded text. CSS on its turn would be injected like this:

    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(scriptContents));
    document.head.appendChild(style);

## Version 3

And then came Witchcraft v3. It was a complete rewrite of the extension logic having as excuse the fact that Chrome had just recently changed behavior and started unloading extensions at its own will. Extensions that relied on caching data in memory would lose information and stop working - and that affected Witchcraft v2.

The intention was to take the chance to upgrade the extension manifest to version 3, since version 2 was getting deprecated at the time. However, for security reasons, version 3 did not support loading of arbitrary scripts - which rendered it impractical to upgrade the manifest.

The new security policy forbids `eval()` and similar script evaluation methods (like `Function()`), something that manifest v2 allows as long as you specify `unsafe-eval` in the security policy property in `manifest.json`:

    "content_security_policy": "script-src 'self' 'unsafe-eval'; object-src 'self'"

I tried running `Function()` in both the content script and the background script with manifest v3, but Chrome simply refuses it:

    Error in event handler: EvalError: Refused to evaluate a string as JavaScript because 'unsafe-eval' is not an allowed source of script in the following Content Security Policy directive: "script-src 'self' 'wasm-unsafe-eval' 'inline-speculation-rules' http://localhost:* http://127.0.0.1:*".

And trying to add `unsafe-eval` to the security policy gives:

    Error: 'content_security_policy.extension_pages': Insecure CSP value "'unsafe-eval'" in directive 'script-src'.

So there is no way around it, because we cannot work around the fact that the script is loaded as text and needs to be converted to a Function, so it can be passed to `chrome.scripting.executeScript()` (to the parameter `func`).

That's why Witchcraft version 3 will still be based on manifest v2. More on that on the "Upgrading to manifest v3" below.

### Getting rid of the content script

Witchcraft v3 gets rid of the content script and relies solely on the background script. The reason I deleted the content script was to make the implementation simpler. I'm not sure if it was not available at the time I first implemented Witchcraft, but the fact is that the API offers ways for the background script to be called whenever a navigation event happens; specifically, the event `chrome.webNavigation.onCommitted`.

### Background script as a module

I wrote the new background script as an ES6 module, but unfortunately manifest v2 does not accept modules. The workaround for that was to load the script via `background.html`, where we can load the script properly:

    <script type="module" src="background.js"></script>

## Upgrading to manifest v3

This [SO answer](https://stackoverflow.com/a/72517800/778272) noted that Google plans to support user scripts, i.e., dynamically loading arbitrary JS and CSS (it mentions [this](https://github.com/Tampermonkey/tampermonkey/issues/644#issuecomment-1140110430) and [this](https://developer.chrome.com/docs/extensions/migrating/known-issues/#userscript-managers-support). The proposal for user scripts is documented [here](https://github.com/w3c/webextensions/blob/main/proposals/user-scripts-api.md).

Whenever support is added, migrating to manifest v3 should then be possible.

Moreover, v3 also supports ES6 modules, so `background.html` will be eventually removed as well. To make it work, this is how the manifest will need to be configured:

    "background": {
        "service_worker": "background.js",
        "type": "module"
    },

A minor note is that migrating to v3 also means replacing `chrome.tabs.executeScript` with `chrome.scripting.executeScript` (considering that running user scripts will be done via that new API).
