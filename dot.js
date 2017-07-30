"use strict";

const
    fs = require('fs'),
    os = require('os'),
    path = require('path'),
    http = require('http'),
    { URL } = require('url');


class DotJsServer {

    constructor () {
        this.scriptsPath = path.join(os.homedir(), '.js/');
        this.server = http.createServer(this.onRequest.bind(this));
        this.server.listen(DotJsServer.PORT, DotJsServer.onServerStarted.bind(null));
    }

    onRequest(request, response) {
        DotJsServer.log(`Received request for "${request.url}"`);
        let resultingScript = '';

        const urlObject = DotJsServer.parseUrl(request.url);

        if (urlObject) {
            resultingScript = this.fetchRelevantScripts(urlObject);
        }

        // we always return success, no matter what; we don't want to pollute Chrome's console with errors
        response.writeHead(200, { 'Content-Type': 'text/javascript' });
        response.end(resultingScript);
    }

    /**
     * Fetches all relevant scripts and return them as a single, aggregated script.
     *
     * @param {Url} url - the url that is requesting the scripts
     * @return {string} all relevant scripts, concatenated into a single string
     */
    fetchRelevantScripts(url) {
        const hostName = url.hostname;

        const parts = hostName.split('.');
        const scriptNames = [];
        for (let i = parts.length - 1; i >= 0; i--) {
            const scriptName = parts.slice(i, parts.length).join('.');
            scriptNames.push(scriptName);
        }
        DotJsServer.log(scriptNames);

        const fullScriptPaths = scriptNames.map(scriptName => path.join(this.scriptsPath, scriptName + '.js'));

        const results = fullScriptPaths.map(scriptPath => DotJsServer.tryToLoadScriptFile(scriptPath));

        return results.join('\n');
    }

    static tryToLoadScriptFile(scriptPath) {
        try {
            return fs.readFileSync(scriptPath, 'utf-8');
        } catch (error) {
            return '';
        }
    }

    static parseUrl(url) {
        const cleanUrl = url.length > 0 ? url.substr(1) : '';  // skip leading `/`
        try {
            return new URL(cleanUrl);
        } catch (error) {
            // probably a ERR_INVALID_URL; just ignore it and return a blank script
            return null;
        }
    }

    static onServerStarted(err) {
        if (err) {
            return console.log('Something bad happened', err);
        }
        console.log(`dot.js server listening on ${DotJsServer.PORT}`);
    }

    static log(...args) {
        console.info(...args);
    }
}

DotJsServer.PORT = 3131;

new DotJsServer();
