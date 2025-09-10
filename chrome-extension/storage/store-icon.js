import {browser} from "../browser/index.js";
import {storage} from "./index.js";
import {util} from "../util/index.js";

export async function storeIcon(iconName, iconData) {
    const encoded = util.typedArrayToBase64(iconData);
    await browser.api.storeKey(storage.makeIconKey(iconName), encoded);
}
