import {analytics} from "../index.js";

export function backgroundLoaded() {
    analytics.agent.fireEvent("background_loaded").then();
}
