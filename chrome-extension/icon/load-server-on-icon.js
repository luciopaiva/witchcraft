import {icon} from "./index.js";

export async function loadServerOnIcon() {
    return await icon.loadIcon(icon.ICON_SERVER_ON_NAME);
}
