
import {path} from "../path/index.js";
import Metrics from "../analytics/metrics.js";
import {loader} from "./index.js";
import {storage} from "../storage/index.js";
import {DEFAULT_SERVER_ADDRESS} from "../constants.js";
import {script} from "../script/index.js";

export async function loadScripts(scriptUrl, tabId, frameId) {
    // clear any info about previously-loaded scripts
    await storage.removeFrame(tabId, frameId);

    const serverAddress = await storage.retrieveServerAddress() ?? DEFAULT_SERVER_ADDRESS;
    /** @type {ScriptContext[]} */
    const scripts = path.generatePotentialScriptNames(scriptUrl)
        .flatMap(path.mapToJsAndCss)
        .map(path.pathTupleToScriptContext)
        .map(script.prependServerOrigin.bind(null, serverAddress));

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

    // persist so the popup window can read it when needed
    const scriptNames = scripts
        .filter(script => script.hasContents)
        .map(script => script.path);
    await storage.storeFrame(tabId, frameId, scriptNames);

    // ToDo dispatch metrics
}
