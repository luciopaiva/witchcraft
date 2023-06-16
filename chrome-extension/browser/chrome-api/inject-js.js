import {chromeApi} from "./index.js";

export function injectJs(contents, tabId, frameId) {
    chromeApi.chrome().tabs.executeScript(tabId, {
        code: contents,
        frameId: frameId,
        runAt: "document_start",
    }, chromeApi.captureRuntimeError);
}
