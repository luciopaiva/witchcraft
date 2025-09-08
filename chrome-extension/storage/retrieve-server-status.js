import {browser} from "../browser/index.js";

export const SERVER_STATUS_KEY = "server-status";

export async function retrieveServerStatus() {
    return (await browser.api.retrieveKey(SERVER_STATUS_KEY)) || false;
}
