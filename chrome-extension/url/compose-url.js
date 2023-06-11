
/**
 * @param {string} origin
 * @param {string} path
 */
export function composeUrl(origin, path) {
    const url = new URL(origin);
    const newUrl = new URL(path, origin);
    return `${newUrl.href}${url.search}${url.hash}`;
}
