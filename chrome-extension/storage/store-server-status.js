import {browser} from "../browser/index.js";
import {SERVER_STATUS_KEY} from "./retrieve-server-status.js";

export async function storeServerStatus(status) {
    await browser.api.storeKey(SERVER_STATUS_KEY, status);
}
