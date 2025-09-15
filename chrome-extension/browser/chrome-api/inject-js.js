import {chromeApi} from "./index.js";

function isUserScriptsEnabled() {
    return typeof chrome?.userScripts?.execute === "function";
}

export function injectJs(contents, tabId, frameId) {
    const enabled = isUserScriptsEnabled();
    console.info(`DEBUG: injectJs using ${enabled ? "userScripts" : "scripting"}`);
    if (enabled) {
        chrome.userScripts.execute({
            injectImmediately: true,
            target: { tabId: tabId, frameIds: [frameId] },
            js: [{
                code: contents,
            }],
            world: "MAIN"
        }).catch(chromeApi.captureRuntimeError);
    } else {
        chromeApi.chrome().scripting.executeScript({
            injectImmediately: true,
            target: { tabId: tabId, frameIds: [frameId] },
            func: (contents) => Function(contents)(),
            args: [contents],
            world: "MAIN"
        }).catch(chromeApi.captureRuntimeError);
    }
}
