import {initialize} from "./initialize.js";
import {updateServerStatus} from "./update-server-status.js";
import {createIcons} from "./create-icons.js";
import {loadServerOnIcon} from "./load-server-on-icon.js";
import {loadServerOffIcon} from "./load-server-off-icon.js";
import {loadIcon} from "./load-icon.js";

const ICON_SIZE = 16;
const ICON_SERVER_ON_NAME = "server-on";
const ICON_SERVER_OFF_NAME = "server-off";

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
