
chrome.runtime.onMessage.addListener(({scriptType, scriptContents}) => {
    if (scriptType === "js") {
        eval(scriptContents);
    } else if (scriptType === "css") {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(scriptContents));
        style.setAttribute("data-witchcraft", "");  // to make it easy finding the element if we want to
        document.head.appendChild(style);
    }
});

chrome.runtime.sendMessage(location.hostname);
