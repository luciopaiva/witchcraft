import {chromeApi} from "./index.js";

export function getAppVersion() {
    return chromeApi.chrome().runtime.getManifest().version;
}
