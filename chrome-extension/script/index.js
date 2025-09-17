
import {util} from "../util/index.js";
import {url} from "../url/index.js";
import {loader} from "../loader.js";
import {EXT_CSS} from "../path.js";
import ScriptContext from "./script-context.js";
import IncludeContext from "./include-context.js";

/**
 *
 * @param {ScriptContext} script
 * @param {IncludeContext} include
 */
function expandInclude(script, include) {
    script.contents = util.spliceString(
        script.contents,
        include.startIndex,
        include.endIndex,
        include.script.contents
    );
}

// either `// @include foo.js` or `/* @include foo.js */`
const INCLUDE_JS_RE = /(?:\/\/|\/\*)[ \t]*@include[ \t]*(".*?"|[^*\s]+).*$/m;
// only `/* @include foo.js */` is acceptable
const INCLUDE_CSS_RE = /\/\*[ \t]*@include[ \t]*(".*?"|\S+)[ \t]*\*\/.*$/m;

/**
 * @param {string} script
 * @param {string} scriptType
 * @return {IncludeContext|undefined}
 */
function findIncludeDirective(script, scriptType) {
    const includeDirective = scriptType === EXT_CSS ? INCLUDE_CSS_RE : INCLUDE_JS_RE;

    const result = script.match(includeDirective);
    if (result) {
        const startIndex = result.index;
        const endIndex = startIndex + result[0].length;

        // determine full path to include file
        const scriptFileName = result[1].replace(/^"|"$/g, "");  // remove quotes, if any
        return new IncludeContext(new ScriptContext(scriptFileName, scriptType), startIndex, endIndex);
    }
}

function prependServerOrigin(serverOrigin, script) {
    script.url = url.composeUrl(serverOrigin, script.path);
    return script;
}

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
async function processIncludeDirective(scriptContext, include, metrics, visitedUrls) {
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

/*
 * Functions are exported like this instead of directly exposed so that they can be unit-tested.
 * See https://javascript.plainenglish.io/unit-testing-challenges-with-modular-javascript-patterns-22cc22397362
 */
export const script = {
    IncludeContext,
    ScriptContext,
    expandInclude,
    findIncludeDirective,
    prependServerOrigin,
    processIncludeDirective,
};
