
/**
 * @param {string} origin
 * @param {string} path
 */
export function composeUrl(origin, path) {
    const url = new URL(origin);
    const newUrl = new URL(path, origin);
    return `${newUrl.href}${url.search}${url.hash}`;
}

export function tryParseUrl(url) {
    try {
        const location = new URL(url);
        return { hostName: location.hostname, pathName: location.pathname };
    } catch (_) {
        return { hostName: "", pathName: "" };
    }
}

/*
 * Functions are exported like this instead of directly exposed so that they can be unit-tested.
 * See https://javascript.plainenglish.io/unit-testing-challenges-with-modular-javascript-patterns-22cc22397362
 */
export const url = {
    composeUrl,
    tryParseUrl,
};
