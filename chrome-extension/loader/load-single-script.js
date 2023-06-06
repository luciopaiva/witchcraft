import {util} from "../util/index.js";
import {FETCH_RESPONSE_OUTCOME} from "../util/fetch-script.js";
import {loader} from "./index.js";

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
export async function loadSingleScript(script, metrics, visitedUrls = new Set()) {
    visitedUrls.add(script.url);

    const fetchResult = await util.fetchScript(script.url);

    updateMetrics(fetchResult.outcome, metrics, script.type);

    if (fetchResult.outcome === FETCH_RESPONSE_OUTCOME.SUCCESS) {
        script.contents = fetchResult.contents;
        await loader.loadIncludes(script, metrics, visitedUrls);
    }
}
