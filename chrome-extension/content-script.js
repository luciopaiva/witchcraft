/*
   This is the part that gets injected in each frame of the page. It signals the Witchcraft background script that a new
   frame has been loaded and gets ready (by creating a listener) to receive and load any matching scripts.
 */

chrome.runtime.onMessage.addListener(({scriptType, scriptContents}) => {
    if (scriptType === "js") {
        Function(scriptContents)();
    } else if (scriptType === "css") {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(scriptContents));
        style.setAttribute("data-witchcraft", "");  // to make it easy finding the element if we want to
        document.head.appendChild(style);
    }
});

chrome.runtime.sendMessage(location);
