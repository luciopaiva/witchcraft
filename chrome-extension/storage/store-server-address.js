import {browser} from "../browser/index.js";
import {SERVER_ADDRESS_KEY} from "./retrieve-server-address.js";

export async function storeServerAddress(address) {
    await browser.api.storeKey(SERVER_ADDRESS_KEY, address);
}
