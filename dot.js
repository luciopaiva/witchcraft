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
        /** @type {Set<string>} List of script paths that are already part of the bundle being prepared. Used to avoid
         *                      dependency cycles. */
        this.visitedScripts = new Set();
        this.server = http.createServer(this.onRequest.bind(this));
        this.server.listen(DotJsServer.PORT, DotJsServer.onServerStarted.bind(null));
    }

    onRequest(request, response) {
        let resultingScript = '';

        const urlObject = DotJsServer.parseUrl(request.url);
        if (urlObject) {
            this.visitedScripts.clear();
            resultingScript = this.fetchRelevantScripts(urlObject);
            DotJsServer.log(`Received request for "${request.url}"`);
            if (this.visitedScripts.size === 0) {
                DotJsServer.log('\tNo scripts found');
            } else {
                DotJsServer.log('\tScripts found:');
                for (const script of this.visitedScripts.keys()) {
                    DotJsServer.log('\t* ' + script);
                }
            }
        } else {
            DotJsServer.log(`Invalid request "${request.url}"`);
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
        // transform `foo.bar.com` into `[com, bar.com, foo.bar.com]`
        const domainLevels = DotJsServer.obtainDomainLevels(url);
        // map domain levels into script paths
        const fullScriptPaths = domainLevels.map(scriptName => path.join(this.scriptsPath, scriptName + '.js'));
        // mark scripts as visited
        fullScriptPaths.forEach(fullScriptPath => this.visitedScripts.add(fullScriptPath));
        // load scripts' contents
        const scriptsContents = fullScriptPaths.map(scriptPath => DotJsServer.tryToLoadScriptFile(scriptPath));
        // start by concatenating initial scripts' contents...
        let scriptBundle = scriptsContents.join('\n');
        // ...and then process include directives, returning the resulting bundle
        return this.processIncludeDirectives(scriptBundle);
    }

    /**
     * Process `@include` directives, replacing them with the actual scripts they refer to. The processing is recursive,
     * i.e., included files also have their `@include` directives processed. The algorithm detects dependency cycles and
     * avoids them by not including any file more than once.
     *
     * @param {string} scriptBundle - raw script to be processed
     * @return {string} - processed script
     */
    processIncludeDirectives(scriptBundle) {
        let result;
        const includeDirective = /^[ \t]*\/\/[ \t]*@include[ \t]*(".*?"|\S+).*$/mg;
        while ((result = includeDirective.exec(scriptBundle)) !== null) {
            const fullMatchStr = result[0];

            // determine full path to include file
            const scriptName = result[1].replace(/^"|"$/g, '');  // remove quotes, if any
            const scriptPath = path.join(this.scriptsPath, scriptName);

            // the matched directive to be cut from the original file
            const endIndex = includeDirective.lastIndex;
            const startIndex = endIndex - fullMatchStr.length;

            // check for dependency cycles
            if (!this.visitedScripts.has(scriptPath)) {
                const scriptContent = DotJsServer.tryToLoadScriptFile(scriptPath);
                scriptBundle = DotJsServer.spliceString(scriptBundle, startIndex, endIndex, scriptContent);

                // put regex caret right where the appended file begins to recursively look for include directives
                includeDirective.lastIndex = startIndex;

                this.visitedScripts.add(scriptPath);  // mark file as already visited
            } else {
                // this script was already included before
                scriptBundle = DotJsServer.spliceString(scriptBundle, endIndex, endIndex,
                    " ERROR! Dependency cycle detected!");
            }
        }

        return scriptBundle;
    }

    /**
     * Returns a list of progressive domain level increments, given an input url. For instance, if the input is a URL
     * like `"foo.bar.com"`, the resulting array will be `['com', 'bar.com', 'foo.bar.com']`.
     *
     * @param {Url} url - URL object
     * @return {Array<string>}
     */
    static obtainDomainLevels(url) {
        const parts = url.hostname.split('.');
        const domainLevels = [];
        for (let i = parts.length - 1; i >= 0; i--) {
            const scriptName = parts.slice(i, parts.length).join('.');
            domainLevels.push(scriptName);
        }

        return domainLevels;
    }

    /**
     * Splices a string. See https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
     * if you're not acquainted with splicing.
     *
     * @param {string} str - string that is going to be spliced
     * @param {number} startIndex - where to start the cut
     * @param {number} endIndex - where to end the cut
     * @param {string} whatToReplaceWith - the string to place where the removed part was
     * @return {string} the resulting string
     */
    static spliceString(str, startIndex, endIndex, whatToReplaceWith) {
        return str.substring(0, startIndex) + whatToReplaceWith + str.substring(endIndex);
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
            return DotJsServer.log('Something bad happened', err);
        }
        DotJsServer.log(`dot.js server listening on ${DotJsServer.PORT}`);
    }

    static log(...args) {
        console.info(...args);
    }
}

DotJsServer.PORT = 3131;

const dot = new DotJsServer();
