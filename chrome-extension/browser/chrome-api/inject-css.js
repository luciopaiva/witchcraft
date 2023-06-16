import {chromeApi} from "./index.js";

export function injectCss(contents, tabId, frameId) {
    chromeApi.chrome().tabs.insertCSS(tabId, {
        code: contents,
        frameId: frameId,
        runAt: "document_start",
    }, chromeApi.captureRuntimeError);
}
