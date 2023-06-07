
import {path} from "../path/index.js";
import Metrics from "../analytics/metrics.js";
import {loader} from "./index.js";
import {script} from "../script/index.js";

export async function loadScripts(url, tabId, frameId) {

    /** @type {ScriptContext[]} */
    const scripts = path.generatePotentialScriptNames(url)
        .flatMap(path.mapToJsAndCss)
        .map(path.pathTupleToScriptContext)
        .map(script.prependServerOrigin);

    const metrics = new Metrics();

    // // load all scripts concurrently
    // const promises = scripts
    //     .map(script => loader.loadSingleScript(script, metrics)
    //         .then(async () => {
    //             if (script.hasContents) {
    //                 await loader.sendScript(script, tabId, frameId);
    //             }
    //         }));
    //
    // // wait until everything is loaded
    // await Promise.allSettled(promises);

    for (const script of scripts) {
        // ToDo scripts are loaded sequentially in order to the final effect to be deterministic, but it would be
        //      interesting to have all of them download asynchronously and then be sent sequentially to the tab
        await loader.loadSingleScript(script, metrics).then(async () => {
            if (script.hasContents) {
                await loader.injectScript(script, tabId, frameId);
            }
        });
    }

    // ToDo persist state to chrome.storage
    // ToDo update popup (should it show an aggregation of all scripts loaded throughout all frames?)
    // ToDo dispatch metrics
}
