import {chromeApi} from "./index.js";

export function injectJs(contents, tabId, frameId) {
    chromeApi.chrome().scripting.executeScript({
        target: { tabId: tabId, frameIds: [frameId] },
        func: (contents) => Function(contents)(),
        args: [contents],
        world: "MAIN"
    }).catch(chromeApi.captureRuntimeError);
}
