import {storage} from "./index.js";

export function frameScriptsKey(tabId, frameId) {
    return `${storage.FRAME_SCRIPTS_KEY_PREFIX}:${tabId}:${frameId}`;
}
