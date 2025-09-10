import {analytics} from "./index.js";

export function page(path, title) {
    analytics.agent.firePageViewEvent(path, title).then();
}
