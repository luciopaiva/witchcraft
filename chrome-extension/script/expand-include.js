import {util} from "../util/index.js";

/**
 *
 * @param {ScriptContext} script
 * @param {IncludeContext} include
 */
export function expandInclude(script, include) {
    script.contents = util.spliceString(
        script.contents,
        include.startIndex,
        include.endIndex,
        include.script.contents
    );
}
