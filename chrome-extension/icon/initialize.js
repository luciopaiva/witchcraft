import {icon} from "./index.js";
import {SERVER_PING_PERIOD_IN_MILLIS} from "../constants.js";

export async function initialize() {
    await icon.createIcons();
    await icon.updateServerStatus();
    setInterval(icon.updateServerStatus, SERVER_PING_PERIOD_IN_MILLIS);
}
