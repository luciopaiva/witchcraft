import {evictStale} from "./evict-stale.js";
import {storeFrame} from "./store-frame.js";
import {frameKey} from "./frame-key.js";
import {removeFrame} from "./remove-frame.js";
import {retrieveFrame} from "./retrieve-frame.js";
import {storeServerAddress} from "./store-server-address.js";
import {retrieveServerAddress} from "./retrieve-server-address.js";

const EVICTION_TIME_KEY = "eviction-time";
const FRAME_KEY_PREFIX = "frame";
const FRAME_KEY_RE = new RegExp(`^${FRAME_KEY_PREFIX}:(?<tab>.*?):(?<frame>.*?)$`);

export const storage = {
    EVICTION_TIME_KEY,
    FRAME_KEY_PREFIX,
    FRAME_KEY_RE,
    evictStale,
    frameKey,
    removeFrame,
    retrieveFrame,
    retrieveServerAddress,
    storeFrame,
    storeServerAddress,
}
