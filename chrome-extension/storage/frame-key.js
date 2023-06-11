import {storage} from "./index.js";

export function frameKey(tabId, frameId) {
    return `${storage.FRAME_KEY_PREFIX}:${tabId}:${frameId}`;
}
