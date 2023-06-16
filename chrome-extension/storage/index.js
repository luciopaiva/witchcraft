import {evictStale} from "./evict-stale.js";
import {storeFrame} from "./store-frame.js";
import {frameKey} from "./frame-key.js";
import {removeFrame} from "./remove-frame.js";
import {retrieveFrame} from "./retrieve-frame.js";
import {storeServerAddress} from "./store-server-address.js";
import {retrieveServerAddress} from "./retrieve-server-address.js";
import {makeTabScriptCountKey} from "./make-tab-script-count-key.js";
import {incrementTabScriptCount} from "./increment-tab-script-count.js";
import {removeTabScriptCount} from "./remove-tab-script-count.js";

const EVICTION_TIME_KEY = "eviction-time";
const FRAME_KEY_PREFIX = "frame";
const TAB_SCRIPT_COUNT_KEY_PREFIX = "tab-script-count";

export const storage = {
    EVICTION_TIME_KEY,
    FRAME_KEY_PREFIX,
    TAB_SCRIPT_COUNT_KEY_PREFIX,
    removeTabScriptCount,
    evictStale,
    frameKey,
    incrementTabScriptCount,
    makeTabScriptCountKey,
    removeFrame,
    retrieveFrame,
    retrieveServerAddress,
    storeFrame,
    storeServerAddress,
}
