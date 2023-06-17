import {analytics} from "../index.js";

export function suspended() {
    analytics.agent.fireEvent("suspended").then();
}
