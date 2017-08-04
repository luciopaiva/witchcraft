"use strict";


/**
 * Ask the local server to retrieve all relevant scripts for this url.
 *
 * @param {{ type: string, hostname: string }} parameters - type is either 'css' or 'js' and hostname is the page's
 * @param {Object} sender - not used
 * @param {Function} callback - will be called back with all scripts bundled into a single string
 */
function retrieveRelatedScriptsFromServer(parameters, sender, callback) {
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

    const SVR_PROTOCOL = 'http';
    const SVR_HOSTNAME = 'localhost';
    const SVR_PORT = 3131;

    // composes a request to our local server (e.g.: http://localhost:3131/css/github.com)
    const requestUrl = `${SVR_PROTOCOL}://${SVR_HOSTNAME}:${SVR_PORT}/${parameters.type}/${parameters.hostname}`;

    httpRequest.open('GET', requestUrl);
    httpRequest.send();

    return true;  // must return true to indicate to our peer that it should keep listening for an asynchronous response
                  // thanks to https://stackoverflow.com/a/20077854/778272
}

chrome.runtime.onMessage.addListener(retrieveRelatedScriptsFromServer);
