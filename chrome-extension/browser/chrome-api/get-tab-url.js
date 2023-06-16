import {chromeApi} from "./index.js";

export function getTabUrl(tabId) {
    return new Promise((resolve, reject) => {
        try {
            chromeApi.chrome().tabs.get(tabId, details => {
                if (chromeApi.captureRuntimeError()) {
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
