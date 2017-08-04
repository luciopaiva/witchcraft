
// ask for CSS content and attach it to the page
chrome.runtime.sendMessage({ type: 'css', hostname: location.hostname }, (cssContent) => {
    "use strict";

    if (cssContent && cssContent.length > 0) {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(cssContent));
        document.head.appendChild(style);
    }
});

// ask for Javascript content: script will be automatically evaluated when the callback is fired
chrome.runtime.sendMessage({ type: 'js', hostname: location.hostname }, eval);
