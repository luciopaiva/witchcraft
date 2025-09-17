
import {browser} from "./browser/index.js";
import {storage} from "./storage/index.js";
import {SERVER_PING_PERIOD_IN_MILLIS} from "./constants.js";
import {util} from "./util/index.js";
import {storeServerStatus} from "./storage/store-server-status.js";

const ICON_SIZE = 16;
const ICON_SERVER_ON_NAME = "server-on";
const ICON_SERVER_OFF_NAME = "server-off";

async function createIcons() {
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

async function initialize() {
    await icon.createIcons();
    await icon.updateServerStatus();
    setInterval(icon.updateServerStatus, SERVER_PING_PERIOD_IN_MILLIS);
}

const cache = new Map();

async function loadIcon(name) {
    let imageData = cache.get(name);
    if (!imageData) {
        const data = await storage.retrieveIcon(name);
        imageData = new ImageData(data, icon.ICON_SIZE, icon.ICON_SIZE);
        cache.set(name, imageData);
    } else {
    }
    return imageData;
}

async function loadServerOffIcon() {
    return await icon.loadIcon(icon.ICON_SERVER_OFF_NAME);
}

async function loadServerOnIcon() {
    return await icon.loadIcon(icon.ICON_SERVER_ON_NAME);
}

async function updateServerStatus() {
    const isOnline = await util.ping();
    const imageData = isOnline ? await icon.loadServerOnIcon() : await icon.loadServerOffIcon();
    await browser.api.setIcon(imageData);
    await storeServerStatus(isOnline);
}

export const icon = {
    ICON_SERVER_ON_NAME,
    ICON_SERVER_OFF_NAME,
    ICON_SIZE,
    createIcons,
    loadIcon,
    loadServerOnIcon,
    loadServerOffIcon,
    initialize,
    updateServerStatus,
};
