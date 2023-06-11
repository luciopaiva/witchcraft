import {browser} from "../browser/index.js";

export const SERVER_ADDRESS_KEY = "server-address";

export async function retrieveServerAddress() {
    return await browser.api.retrieveKey(SERVER_ADDRESS_KEY);
}
