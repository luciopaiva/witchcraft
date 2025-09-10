import {installed} from "./installed.js";
import {backgroundLoaded} from "./background-loaded.js";
import {suspended} from "./suspended.js";
import {scriptsLoaded} from "./scripts-loaded.js";

export const event = {
    installed,
    backgroundLoaded,
    scriptsLoaded,
    suspended,
};
