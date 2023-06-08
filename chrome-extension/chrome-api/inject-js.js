import {util} from "../util/index.js";
import {chromeApi} from "./index.js";

export function injectJs(contents, tabId, frameId) {
    chromeApi.chrome().tabs.executeScript(tabId, {
        code: util.embedScript(contents),
        frameId: frameId,
        runAt: "document_start",
    });
}
