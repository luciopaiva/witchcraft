import {browser} from "../browser/index.js";
import {DEFAULT_SERVER_ADDRESS} from "../constants.js";

export const SERVER_ADDRESS_KEY = "server-address";

export async function retrieveServerAddress(defaultAddress = DEFAULT_SERVER_ADDRESS) {
    return (await browser.api.retrieveKey(SERVER_ADDRESS_KEY)) ?? defaultAddress;
}
