
import {url} from "../url/index.js";

export function prependServerOrigin(serverOrigin, script) {
    script.url = url.composeUrl(serverOrigin, script.path);
    return script;
}
