import {storage} from "../../storage/index.js";
import {badge} from "./index.js";

export async function increment(tabId, delta) {
    const totalCount = await storage.incrementTabScriptCount(tabId, delta);
    await badge.set(tabId, totalCount);
}
