import {icon} from "./index.js";

export async function loadServerOffIcon() {
    return await icon.loadIcon(icon.ICON_SERVER_OFF_NAME);
}
