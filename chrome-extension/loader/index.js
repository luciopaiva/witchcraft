import {loadIncludes} from "./load-includes.js";
import {loadScripts} from "./load-scripts.js";
import {loadSingleScript} from "./load-single-script.js";
import {injectScript} from "./inject-script.js";
import {embedScript} from "./embed-script.js";

export const loader = {
    embedScript,
    loadIncludes,
    loadScripts,
    loadSingleScript,
    injectScript,
};
