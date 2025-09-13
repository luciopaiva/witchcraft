
import {iterateDomainLevels} from "./iterate-domain-levels.js";
import {iteratePathSegments} from "./iterate-path-segments.js";
import {tryParseUrl} from "../url/try-parse-url.js";

export const GLOBAL_SCRIPT_NAME = "_global";

export function generatePotentialScriptNames(url) {
    const {hostName, pathName} = tryParseUrl(url);

    const domains = [GLOBAL_SCRIPT_NAME, ...iterateDomainLevels(hostName)];
    const paths = [...iteratePathSegments(pathName)];
    const result = [];

    for (const domain of domains) {
        result.push(domain);
        for (const path of paths) {
            result.push(domain + path);
        }
    }

    return result;
}
