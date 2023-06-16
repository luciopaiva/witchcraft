
import {path} from "../path/index.js";
import {storage} from "../storage/index.js";
import {DEFAULT_SERVER_ADDRESS} from "../constants.js";
import {script} from "../script/index.js";
import {loader} from "./index.js";
import {badge} from "../browser/badge/index.js";

export async function loadScripts(scriptUrl, tabId, frameId) {
    // clear any info about previously-loaded scripts
    await storage.removeFrame(tabId, frameId);
    if (frameId === 0) {
        await badge.clear(tabId);
    }

    const serverAddress = await storage.retrieveServerAddress() ?? DEFAULT_SERVER_ADDRESS;
    /** @type {ScriptContext[]} */
    const scripts = path.generatePotentialScriptNames(scriptUrl)
        .flatMap(path.mapToJsAndCss)
        .map(path.pathTupleToScriptContext)
        .map(script.prependServerOrigin.bind(null, serverAddress));

    const metrics = await loader.fetchAndInject(scripts, tabId, frameId);

    // persist so the popup window can read it when needed
    const scriptNames = scripts
        .filter(script => script.hasContents)
        .map(script => script.path);
    await storage.storeFrame(tabId, frameId, scriptNames);

    // update the icon badge for this tab
    await badge.increment(tabId, scriptNames.length);

    // ToDo dispatch metrics
}
