
export function isValidUrl(url) {
    return (typeof url === "string") && !url.startsWith("chrome-extension://");
}
