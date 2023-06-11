import {chromeApi} from "./index.js";

export function getManifestVersion() {
    return chromeApi.chrome().runtime.getManifest().version;
}
