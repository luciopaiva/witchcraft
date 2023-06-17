import {analytics} from "./index.js";
import {browser} from "../browser/index.js";

export async function fireInstall() {
    return await analytics.agent.fireEvent("install", {
        "app_version": browser.api.getAppVersion(),
    });
}
