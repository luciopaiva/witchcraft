import {analytics} from "../index.js";

/**
 * @param {Metrics} metrics
 */
export function scriptsLoaded(metrics) {
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
