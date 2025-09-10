import {storage} from "./index.js";

export function makeTabScriptCountKey(tabId) {
    return `${storage.TAB_SCRIPT_COUNT_KEY_PREFIX}:${tabId}`;
}
