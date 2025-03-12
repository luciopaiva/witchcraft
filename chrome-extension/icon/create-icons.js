import {browser} from "../browser/index.js";
import {storage} from "../storage/index.js";
import {icon} from "./index.js";

export async function createIcons() {
    const image = await loadImage("/witch-16.png");
    await makeIconWithStatusColor(image, "#00ff00", icon.ICON_SERVER_ON_NAME);
    await makeIconWithStatusColor(image, "#ff0000", icon.ICON_SERVER_OFF_NAME);
}

async function loadImage(path) {
    const response = await fetch(browser.api.getFileUrl(path));
    const blob = await response.blob();
    return await createImageBitmap(blob);
}

async function makeIconWithStatusColor(baseImage, color, iconKey) {
    const canvas = new OffscreenCanvas(icon.ICON_SIZE, icon.ICON_SIZE);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(baseImage, 0, 0);

    ctx.fillStyle = color;
    ctx.beginPath();
    const size = 3;
    ctx.fillRect(icon.ICON_SIZE - size, 0, size, size);
    ctx.fill();

    const imageData = ctx.getImageData(0, 0, icon.ICON_SIZE, icon.ICON_SIZE);
    await storage.storeIcon(iconKey, imageData.data);
}
