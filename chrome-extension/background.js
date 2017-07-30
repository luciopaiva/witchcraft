"use strict";


/**
 * Ask the local server to retrieve all relevant scripts for this url.
 *
 * @param {string} url - the url for which the scripts will be fetched
 * @param {Object} sender - not used
 * @param {Function} callback - will be called back with all scripts bundled into a single string
 */
function retrieveRelatedScriptsFromServer(url, sender, callback) {
    const httpRequest = new XMLHttpRequest();

    httpRequest.addEventListener('readystatechange', () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                callback(httpRequest.responseText);
            } else {
                callback('');  // pass empty script if something fails; I think we need this for the other peer to close
            }
        }
    });

    const SERVER_PROTOCOL = 'http';
    const SERVER_HOSTNAME = 'localhost';
    const SERVER_PORT = 3131;
    const requestUrl = `${SERVER_PROTOCOL}://${SERVER_HOSTNAME}:${SERVER_PORT}/${url}`;

    httpRequest.open('GET', requestUrl);
    httpRequest.send();

    return true;  // must return true to indicate to our peer that it should keep listening for an asynchronous response
                  // thanks to https://stackoverflow.com/a/20077854/778272
}

chrome.runtime.onMessage.addListener(retrieveRelatedScriptsFromServer);
