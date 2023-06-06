
/**
 * @param {string} baseUrl
 * @param {string} path
 */
export function resolveIncludeUrl(baseUrl, path) {
    const url = new URL(baseUrl);
    const newUrl = new URL(path, baseUrl);
    return `${newUrl.href}${url.search}${url.hash}`;
}
