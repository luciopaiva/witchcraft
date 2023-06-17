import {browser} from "../browser/index.js";

export async function clear() {
    await browser.api.clearStorage();
}
