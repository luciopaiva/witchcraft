
export const EXT_JS = "js";
export const EXT_CSS = "css";

/**
 * Maps "foo.bar.com/fizz/buzz.html" to ["foo.bar.com/fizz/buzz.html.js", "foo.bar.com/fizz/buzz.html.css"].
 *
 * @param {string} path
 * @returns {[[string, string], [string, string]]}
 */
export function mapToJsAndCss(path) {
    return [
        [path, EXT_JS],
        [path, EXT_CSS],
    ];
}
