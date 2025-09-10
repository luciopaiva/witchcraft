import {loadIncludes} from "./load-includes.js";
import {loadScripts} from "./load-scripts.js";
import {loadSingleScript} from "./load-single-script.js";
import {injectScript} from "./inject-script.js";
import {fetchAndInject} from "./fetch-and-inject.js";

export const loader = {
    fetchAndInject,
    loadIncludes,
    loadScripts,
    loadSingleScript,
    injectScript,
};
