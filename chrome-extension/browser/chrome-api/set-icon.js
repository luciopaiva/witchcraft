import {chromeApi} from "./index.js";

export async function setIcon(imageData) {
    return new Promise(resolve => {
        chromeApi.chrome().action.setIcon({
            imageData: imageData
        }, resolve);
    });
}
