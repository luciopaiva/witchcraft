import {chromeApi} from "./index.js";

export async function createTab(url) {
    return new Promise(resolve => {
        chromeApi.chrome().tabs.create({ url }, tab => resolve(tab));
    });
}
