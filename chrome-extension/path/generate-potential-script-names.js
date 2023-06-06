
import {iterateDomainLevels} from "./iterate-domain-levels.js";
import {iteratePathSegments} from "./iterate-path-segments.js";
import {tryParseUrl} from "../url/try-parse-url.js";

export const GLOBAL_SCRIPT_NAME = "_global";

export function generatePotentialScriptNames(url) {
    const {hostName, pathName} = tryParseUrl(url);
    const result = [];
    result.push(GLOBAL_SCRIPT_NAME);
    result.push(...iterateDomainLevels(hostName));
    const paths = Array.from(iteratePathSegments(pathName));
    if (paths.length > 0) {
        result.push(...paths.map(path => hostName + path))
    }
    return result;
}
