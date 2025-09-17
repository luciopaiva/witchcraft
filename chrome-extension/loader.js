import {script as scripts} from "./script/index.js";
import {FETCH_RESPONSE_OUTCOME} from "./util/fetch-script.js";
import {util} from "./util/index.js";
import {EXT_CSS, EXT_JS} from "./path.js";
import {browser} from "./browser/index.js";
import {storage} from "./storage/index.js";
import path from "./path.js";
import {badge} from "./browser/badge/index.js";
import Metrics from "./analytics/metrics.js";

/**
 * Fetches scripts from the server and injects those that were found.
 *
 * The input script order is guaranteed to be respected. This function will cleverly fetch all scripts in parallel, but
 * will inject them in the intended order. This means that if a given script S takes longer to fetch (e.g., a remote
 * file), all subsequent script injections will hold until S is either downloaded and fetched or failed (in case of
 * HTTP 404).
 *
 * @param {Script[]} scripts
 * @param {number} tabId
 * @param {number} frameId
 * @returns {Promise<Metrics>}
 */
async function fetchAndInject(scripts, tabId, frameId) {
    const metrics = new Metrics();

    // start fetching all immediately, in parallel
    const fetchPromises = scripts.map(async script => await loader.loadSingleScript(script, metrics));

    // prepare functions, but do not run them yet
    const injectTasks = scripts.map(script => tryInject.bind(null, script, tabId, frameId));

    const orderedTasks = util.zip(fetchPromises, injectTasks).flat();

    await util.sequential(orderedTasks);

    return metrics;
}

async function tryInject(script, tabId, frameId) {
    if (script.hasContents) {
        await loader.injectScript(script, tabId, frameId);
    }
}

/**
 * @param {ScriptContext} script
 * @param {number} tabId
 * @param {number} frameId
 * @returns {Promise<void>}
 */
async function injectScript(script, tabId, frameId) {
    if (script.type === EXT_JS) {
        injectJs(script.url, script.contents, tabId, frameId);
    } else if (script.type === EXT_CSS) {
        injectCss(script.url, script.contents, tabId, frameId);
    }
}

function injectJs(url, contents, tabId, frameId) {
    browser.injectJs(contents, tabId, frameId);
    logInjection(tabId, frameId, "JS", url);
}

function injectCss(url, contents, tabId, frameId) {
    browser.injectCss(contents, tabId, frameId);
    logInjection(tabId, frameId, "CSS", url);
}

function logInjection(tabId, frameId, type, scriptUrl) {
    let tabUrl = "failed to obtain URL";
    browser.getTabUrl(tabId)
        .then(retrievedUrl => {
            tabUrl = retrievedUrl ?? "blank URL";
        })
        .catch(() => { /* do nothing */ })
        .finally(() => {
            const tabAndFrame = `tab ${tabId}, frame ${frameId}`;
            console.info(`Injected ${type} ${scriptUrl} into [${tabAndFrame}] (${tabUrl})`);
        });
}

async function loadIncludes(script, metrics, visitedUrls) {
    let include = scripts.findIncludeDirective(script.contents, script.type);
    while (include) {
        await scripts.processIncludeDirective(script, include, metrics, visitedUrls);
        scripts.expandInclude(script, include);

        include = scripts.findIncludeDirective(script.contents, script.type);
    }
}

async function loadScripts(scriptUrl, tabId, frameId) {
    // clear any info about previously-loaded scripts
    await storage.removeFrame(tabId, frameId);
    if (frameId === 0) {
        await storage.clearAllFrames(tabId);
        await badge.clear(tabId);
    }

    const serverAddress = await storage.retrieveServerAddress();
    /** @type {ScriptContext[]} */
    const scriptCandidates = path.generatePotentialScriptNames(scriptUrl)
        .flatMap(path.mapToJsAndCss)
        .map(path.pathTupleToScriptContext)
        .map(scripts.prependServerOrigin.bind(null, serverAddress));

    const metrics = await loader.fetchAndInject(scriptCandidates, tabId, frameId);

    // persist so the popup window can read it when needed
    const scriptNames = scriptCandidates
        .filter(script => script.hasContents)
        .map(script => script.path);

    if (scriptNames.length > 0) {
        await storage.storeFrame(tabId, frameId, scriptNames);

        // update the icon badge for this tab
        await badge.registerScripts(tabId, frameId, scriptNames);
    }

    return metrics;
}

function updateMetrics(outcome, metrics, scriptType) {
    switch (outcome) {
        case FETCH_RESPONSE_OUTCOME.SUCCESS:
            return metrics.incrementHitCount(scriptType);
        case FETCH_RESPONSE_OUTCOME.SERVER_FAILURE:
            return metrics.incrementErrorCount();
        case FETCH_RESPONSE_OUTCOME.FETCH_FAILURE:
            return metrics.incrementFailCount();
    }
}

/**
 *
 * @param {ScriptContext} script
 * @param {Metrics} metrics
 * @param {Set<string>} visitedUrls
 * @returns {Promise<void>}
 */
async function loadSingleScript(script, metrics, visitedUrls = new Set()) {
    visitedUrls.add(script.url);

    const fetchResult = await util.fetchScript(script.url);

    updateMetrics(fetchResult.outcome, metrics, script.type);

    if (fetchResult.outcome === FETCH_RESPONSE_OUTCOME.SUCCESS) {
        script.contents = fetchResult.contents;
        await loader.loadIncludes(script, metrics, visitedUrls);
    }
}

export const loader = {
    fetchAndInject,
    loadIncludes,
    loadScripts,
    loadSingleScript,
    injectScript,
};
