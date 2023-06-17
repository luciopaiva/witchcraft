import {evictStale} from "./evict-stale.js";
import {storeFrame} from "./store-frame.js";
import {frameScriptsKey} from "./frame-scripts-key.js";
import {removeFrame} from "./remove-frame.js";
import {retrieveFrame} from "./retrieve-frame.js";
import {storeServerAddress} from "./store-server-address.js";
import {retrieveServerAddress} from "./retrieve-server-address.js";
import {makeTabScriptCountKey} from "./make-tab-script-count-key.js";
import {incrementTabScriptCount} from "./increment-tab-script-count.js";
import {removeTabScriptCount} from "./remove-tab-script-count.js";
import {storeIcon} from "./store-icon.js";
import {retrieveIcon} from "./retrieve-icon.js";
import {makeIconKey} from "./make-icon-key.js";

const EVICTION_TIME_KEY = "eviction-time";
const FRAME_SCRIPTS_KEY_PREFIX = "frame-scripts";
const TAB_SCRIPT_COUNT_KEY_PREFIX = "tab-script-count";
const ICON_KEY_PREFIX = "icon";

export const storage = {
    EVICTION_TIME_KEY,
    ICON_KEY_PREFIX,
    FRAME_SCRIPTS_KEY_PREFIX,
    TAB_SCRIPT_COUNT_KEY_PREFIX,
    removeTabScriptCount,
    evictStale,
    frameScriptsKey,
    incrementTabScriptCount,
    makeIconKey,
    makeTabScriptCountKey,
    removeFrame,
    retrieveFrame,
    retrieveIcon,
    retrieveServerAddress,
    storeFrame,
    storeIcon,
    storeServerAddress,
}
