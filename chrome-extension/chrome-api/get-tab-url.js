import {chromeApi} from "./index.js";

export function getTabUrl(tabId) {
    return new Promise((resolve, reject) => {
        try {
            chromeApi.chrome().tabs.get(tabId, details => resolve(details.url));
        } catch (e) {
            reject(e);
        }
    });
}
