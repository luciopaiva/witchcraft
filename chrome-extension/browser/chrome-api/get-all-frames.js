import {chromeApi} from "./index.js";

export async function getAllFrames(tabId) {
    return new Promise(resolve => {
        chromeApi.chrome().webNavigation.getAllFrames({ tabId: tabId }, details => {
            resolve(details?.map(frame => frame.frameId) ?? []);
        });
    });
}
