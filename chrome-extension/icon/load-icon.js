import {storage} from "../storage/index.js";
import {icon} from "./index.js";

const cache = new Map();

export async function loadIcon(name) {
    let imageData = cache.get(name);
    if (!imageData) {
        const data = await storage.retrieveIcon(name);
        imageData = new ImageData(data, icon.ICON_SIZE, icon.ICON_SIZE);
        cache.set(name, imageData);
    } else {
    }
    return imageData;
}
