import {script as Script} from "../script/index.js";

export async function loadIncludes(script, metrics, visitedUrls) {
    let include = Script.findIncludeDirective(script.contents, script.type);
    while (include) {
        await Script.processIncludeDirective(script, include, metrics, visitedUrls);
        Script.expandInclude(script, include);

        include = Script.findIncludeDirective(script.contents, script.type);
    }
}
