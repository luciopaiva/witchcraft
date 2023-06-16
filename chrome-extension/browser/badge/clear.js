import {storage} from "../../storage/index.js";
import {badge} from "./index.js";

export async function clear(tabId) {
    await storage.removeTabScriptCount(tabId);
    await badge.set(tabId, 0);
}
