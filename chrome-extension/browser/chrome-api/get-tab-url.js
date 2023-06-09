import {chromeApi} from "./index.js";

export function getTabUrl(tabId) {
    return new Promise((resolve, reject) => {
        try {
            chromeApi.chrome().tabs.get(tabId, details => {
                if (chromeApi.chrome().runtime?.lastError) {
                    console.error("getTabUrl ended in error:");
                    console.error(chromeApi.chrome().runtime.lastError);
                    reject();
                } else {
                    resolve(details?.url);
                }
            });
        } catch (e) {
            console.error(e);
            reject();
        }
    });
}
