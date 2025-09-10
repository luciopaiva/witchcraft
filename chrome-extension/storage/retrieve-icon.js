import {browser} from "../browser/index.js";
import {storage} from "./index.js";
import {util} from "../util/index.js";

export async function retrieveIcon(iconName) {
    const base64 = await browser.api.retrieveKey(storage.makeIconKey(iconName));
    return util.base64ToTypedArray(base64, Uint8ClampedArray);
}
