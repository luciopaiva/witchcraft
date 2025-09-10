import {storage} from "./index.js";

export function makeIconKey(iconName) {
    return `${storage.ICON_KEY_PREFIX}:${iconName}`;
}
