
import {analytics} from "./index.js";

function installed() {
    analytics.agent.fireEvent("installed").then();
}

function backgroundLoaded() {
    analytics.agent.fireEvent("background_loaded").then();
}

/**
 * @param {Metrics} metrics
 */
function scriptsLoaded(metrics) {
    const params = {
        js_hit_count: metrics.jsHitCount,
        js_include_hit_count: metrics.jsIncludesHitCount,
        js_include_miss_count: metrics.jsIncludesNotFoundCount,
        css_hit_count: metrics.cssHitCount,
        css_include_hit_count: metrics.cssIncludesHitCount,
        css_include_miss_count: metrics.cssIncludesNotFoundCount,
        server_error_count: metrics.errorCount,
        fetch_fail_count: metrics.failCount,
    };
    analytics.agent.fireEvent("scripts_loaded", params).then();
}

function suspended() {
    analytics.agent.fireEvent("suspended").then();
}

const event = {
    installed,
    backgroundLoaded,
    scriptsLoaded,
    suspended,
};

export default event;
