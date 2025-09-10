import {chromeApi} from "./index.js";

export async function getActiveTabId() {
    return new Promise(resolve => {
        chromeApi.chrome().tabs.query({ active: true, currentWindow: true }, tabs => {
            if (Array.isArray(tabs) && tabs.length > 0) {
                resolve(tabs[0].id);
            } else {
                resolve(undefined);
            }
        });
    });
}
