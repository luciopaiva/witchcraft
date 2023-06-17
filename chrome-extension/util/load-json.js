import {browser} from "../browser/index.js";

export async function loadJson(jsonFileName, fetchFn = fetch) {
    try {
        const response = await fetchFn(browser.api.getFileUrl(jsonFileName));
        if (response.ok) {
            return await response.json();
        }
    } catch (_) {
    }
    return undefined;
}
