import {iterateDomainLevels} from "./iterate-domain-levels.js";
import {mapToJsAndCss} from "./map-to-js-and-css.js";
import {iteratePathSegments} from "./iterate-path-segments.js";
import {generatePotentialScriptNames} from "./generate-potential-script-names.js";
import {pathTupleToScriptContext} from "./path-tuple-to-script-context.js";

/*
 * Functions are exported like this instead of directly exposed so that they can be unit-tested.
 * See https://javascript.plainenglish.io/unit-testing-challenges-with-modular-javascript-patterns-22cc22397362
 */
export const path = {
    generatePotentialScriptNames,
    iterateDomainLevels,
    iteratePathSegments,
    mapToJsAndCss,
    pathTupleToScriptContext,
};
