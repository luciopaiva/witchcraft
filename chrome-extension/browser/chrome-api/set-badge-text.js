import {chromeApi} from "./index.js";

export async function setBadgeText(tabId, text) {
    return new Promise(resolve => {
        chromeApi.chrome().browserAction.setBadgeText({
            tabId,
            text,
        }, () => {
            chromeApi.captureRuntimeError();
            resolve();
        });
    });
}
