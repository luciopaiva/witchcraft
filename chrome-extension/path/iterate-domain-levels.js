
/**
 * Maps a domain like "foo.bar.com" to ("com", "bar.com", "foo.bar.com").
 *
 * @param {string} hostName
 * @returns {IterableIterator<string>}
 */
export function *iterateDomainLevels(hostName = "") {
    const parts = hostName.split(".").filter(p => p.length > 0);
    for (let i = parts.length - 1; i >= 0; i--) {
        yield parts.slice(i, parts.length).join(".");
    }
}
