import {chromeApi} from "./index.js";

export function injectCss(contents, tabId, frameId) {
    chromeApi.chrome().scripting.insertCSS({
        css: contents,
        target: {
            tabId: tabId,
            frameIds: [frameId]
        },
    }).catch(chromeApi.captureRuntimeError);
}
