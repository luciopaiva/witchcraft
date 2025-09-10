
export function tryParseUrl(url) {
    try {
        const location = new URL(url);
        return { hostName: location.hostname, pathName: location.pathname };
    } catch (_) {
        return { hostName: "", pathName: "" };
    }
}
