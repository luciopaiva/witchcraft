

console.info("this is the content script running");

// Send a message to the background script with the tabId
chrome.runtime.sendMessage("foo");

// Receive a response from the background script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.response === 'success') {
        console.log('TabId received by background script:', message.tabId);
    }
});
