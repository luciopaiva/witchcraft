
import {loader} from "../loader.js";
import {url} from "../url/index.js";

/**
 * Process `@include` directives, replacing them with the actual scripts they refer to. The processing is recursive,
 * i.e., included files also have their `@include` directives processed. The algorithm detects dependency cycles and
 * avoids them by not including any file more than once.
 *
 * @param {ScriptContext} scriptContext
 * @param {IncludeContext} include
 * @param {Metrics} metrics
 * @param {Set<string>} visitedUrls
 * @return {Promise<void>}
 */
export async function processIncludeDirective(scriptContext, include, metrics, visitedUrls) {
    const includeUrl = include.script.url = url.composeUrl(scriptContext.url, include.script.path);

    // check for dependency cycles
    if (!visitedUrls.has(includeUrl)) {
        await loader.loadSingleScript(include.script, metrics, visitedUrls);

        if (include.script.hasContents) {
            metrics.incrementIncludesHit(scriptContext.type);
        } else {
            // script not found or error
            include.script.contents = `/* WITCHCRAFT: could not include "${includeUrl}"; script was not found */`;

            metrics.incrementIncludesNotFound(scriptContext.type);
        }
    } else {
        // this script was already included before
        include.script.contents = `/* WITCHCRAFT: skipping inclusion of "${includeUrl}" due to dependency cycle */`;
    }
}
