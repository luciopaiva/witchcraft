
import ScriptContext from "./script/script-context.js";
import {tryParseUrl} from "./url/index.js";

export const GLOBAL_SCRIPT_NAME = "_global";
export const EXT_JS = "js";
export const EXT_CSS = "css";

function generatePotentialScriptNames(url) {
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

/**
 * Maps a domain like "foo.bar.com" to ("com", "bar.com", "foo.bar.com").
 *
 * @param {string} hostName
 * @returns {IterableIterator<string>}
 */
function *iterateDomainLevels(hostName = "") {
    const parts = hostName.split(".").filter(p => p.length > 0);
    for (let i = parts.length - 1; i >= 0; i--) {
        yield parts.slice(i, parts.length).join(".");
    }
}

/**
 * Maps a path like "/foo/bar/index.html" to ("/foo", "/foo/bar", "/foo/bar/index.html").
 *
 * @param {string} pathName
 * @return {IterableIterator<string>}
 */
function *iteratePathSegments(pathName = "/") {
    const segments = pathName
        .split(/\/+/)
        .filter(s => s.length > 0);

    for (let i = 1; i <= segments.length; i++) {
        yield "/" + segments.slice(0, i).join("/");
    }
}

/**
 * Maps "foo.bar.com/fizz/buzz.html" to ["foo.bar.com/fizz/buzz.html.js", "foo.bar.com/fizz/buzz.html.css"].
 *
 * @param {string} path
 * @returns {[[string, string], [string, string]]}
 */
function mapToJsAndCss(path) {
    return [
        [path, EXT_JS],
        [path, EXT_CSS],
    ];
}

function pathTupleToScriptContext([path, ext]) {
    return new ScriptContext(appendExtension(path, ext), ext);
}

function appendExtension(path, ext) {
    return `${path}.${ext}`;
}

/*
 * Functions are exported like this instead of directly exposed so that they can be unit-tested.
 * See https://javascript.plainenglish.io/unit-testing-challenges-with-modular-javascript-patterns-22cc22397362
 */
const path = {
    generatePotentialScriptNames,
    iterateDomainLevels,
    iteratePathSegments,
    mapToJsAndCss,
    pathTupleToScriptContext,
};

export default path;
