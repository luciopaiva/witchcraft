import IncludeContext from "./include-context.js";
import ScriptContext from "./script-context.js";
import {expandInclude} from "./expand-include.js";
import {findIncludeDirective} from "./find-include-directive.js";
import {processIncludeDirective} from "./process-include-directive.js";
import {prependServerOrigin} from "./prepend-server-origin.js";

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
