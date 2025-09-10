import {util} from "../util/index.js";
import {browser} from "../browser/index.js";
import {icon} from "./index.js";
import {storeServerStatus} from "../storage/store-server-status.js";

export async function updateServerStatus() {
    const isOnline = await util.ping();
    const imageData = isOnline ? await icon.loadServerOnIcon() : await icon.loadServerOffIcon();
    await browser.api.setIcon(imageData);
    await storeServerStatus(isOnline);
}
