import {analytics} from "../index.js";

export function installed() {
    analytics.agent.fireEvent("installed").then();
}
