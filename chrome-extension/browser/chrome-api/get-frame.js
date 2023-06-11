import {chromeApi} from "./index.js";

export async function getFrame(tabId, frameId) {
    return new Promise(resolve => {
        chromeApi.chrome().webNavigation.getFrame({ tabId, frameId }, resolve);
    });
}
