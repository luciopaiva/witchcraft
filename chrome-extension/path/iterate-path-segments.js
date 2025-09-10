
/**
 * Maps a path like "/foo/bar/index.html" to ("/foo", "/foo/bar", "/foo/bar/index.html").
 *
 * @param {string} pathName
 * @return {IterableIterator<string>}
 */
export function *iteratePathSegments(pathName = "/") {
    const segments = pathName
        .split(/\/+/)
        .filter(s => s.length > 0);

    for (let i = 1; i <= segments.length; i++) {
        yield "/" + segments.slice(0, i).join("/");
    }
}
