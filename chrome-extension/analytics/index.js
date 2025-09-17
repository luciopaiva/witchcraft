import Metrics from "./metrics.js";
import agent from "./agent.js";
import events from "./events.js";

function page(path, title) {
    analytics.agent.firePageViewEvent(path, title).then();
}

export const analytics = {
    Metrics,
    agent,
    events,
    page,
};
