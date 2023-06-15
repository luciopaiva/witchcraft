import {loader} from "./index.js";
import {util} from "../util/index.js";
import Metrics from "../analytics/metrics.js";

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
export async function fetchAndInject(scripts, tabId, frameId) {
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
