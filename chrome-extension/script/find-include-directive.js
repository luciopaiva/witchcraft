
import {EXT_CSS} from "../path/index.js";
import IncludeContext from "./include-context.js";
import ScriptContext from "./script-context.js";

// either `// @include foo.js` or `/* @include foo.js */`
const INCLUDE_JS_RE = /(?:\/\/|\/\*)[ \t]*@include[ \t]*(".*?"|[^*\s]+).*$/m;
// only `/* @include foo.js */` is acceptable
const INCLUDE_CSS_RE = /\/\*[ \t]*@include[ \t]*(".*?"|\S+)[ \t]*\*\/.*$/m;


/**
 * @param {string} script
 * @param {string} scriptType
 * @return {IncludeContext|undefined}
 */
export function findIncludeDirective(script, scriptType) {
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
