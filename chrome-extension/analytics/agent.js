/*
 * Adapted from https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/functional-samples/tutorial.google-analytics/scripts/google-analytics.js
 */
import {browser} from "../browser/index.js";
import {util} from "../util/index.js";

const GA_ENDPOINT = 'https://www.google-analytics.com/mp/collect';

const credentials = await util.loadJson("/credentials.json");
if (credentials) {
    console.info("GA is enabled.");
} else {
    console.info("Could not load GA credentials - analytics disabled.");
}

const DEFAULT_ENGAGEMENT_TIME_MSEC = 100;

// Duration of inactivity after which a new session is created
const SESSION_EXPIRATION_IN_MIN = 30;

export class Agent {
    constructor(measurementId, apiSecret, debug = true) {
        this.measurementId = measurementId;
        this.apiSecret = apiSecret;
        this.hasCredentials = measurementId && apiSecret;
        this.debug = debug;
    }

    // Returns the client id, or creates a new one if one doesn't exist.
    // Stores client id in local storage to keep the same client id as long as
    // the extension is installed.
    async getOrCreateClientId() {
        // let { clientId } = await chrome.storage.local.get('clientId');
        let clientId = await browser.api.retrieveKey("ga-client-id");
        if (!clientId) {
            // Generate a unique client ID, the actual value is not relevant
            clientId = self.crypto.randomUUID();
            // await chrome.storage.local.set({ clientId });
            await browser.api.storeKey("ga-client-id", clientId);
        }
        return clientId;
    }

    // Returns the current session id, or creates a new one if one doesn't exist or
    // the previous one has expired.
    async getOrCreateSessionId() {
        // Use storage.session because it is only in memory
        // ToDo use storage.session after migrating to manifest v3
        // let { sessionData } = await chrome.storage.session.get('sessionData');
        let sessionData = await browser.api.retrieveKey("ga-session-data");
        const currentTimeInMs = Date.now();
        // Check if session exists and is still valid
        if (sessionData && sessionData.timestamp) {
            // Calculate how long ago the session was last updated
            const durationInMin = (currentTimeInMs - sessionData.timestamp) / 60000;
            // Check if last update lays past the session expiration threshold
            if (durationInMin > SESSION_EXPIRATION_IN_MIN) {
                // Clear old session id to start a new session
                sessionData = null;
            } else {
                // Update timestamp to keep session alive
                sessionData.timestamp = currentTimeInMs;
                // await chrome.storage.session.set({ sessionData });
                await browser.api.storeKey("ga-session-data", sessionData);
            }
        }
        if (!sessionData) {
            // Create and store a new session
            sessionData = {
                session_id: currentTimeInMs.toString(),
                timestamp: currentTimeInMs.toString()
            };
            // await chrome.storage.session.set({ sessionData });
            await browser.api.storeKey("ga-session-data", sessionData);
        }
        return sessionData.session_id;
    }

    // Fires an event with optional params. Event names must only include letters and underscores.
    async fireEvent(name, params = {}) {
        if (!this.hasCredentials) {
            this.debug && console.info("Skipping GA event");
            return;
        }

        // Configure session id and engagement time if not present, for more details see:
        // https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events?client_type=gtag#recommended_parameters_for_reports
        if (!params.session_id) {
            params.session_id = await this.getOrCreateSessionId();
        }
        if (!params.engagement_time_msec) {
            params.engagement_time_msec = DEFAULT_ENGAGEMENT_TIME_MSEC;
        }
        if (this.debug) {
            params.debug_mode = true;
        }
        params.app_version = browser.api.getAppVersion();

        this.debug && console.info(`GA event`, name, params);

        const url = `${GA_ENDPOINT}?measurement_id=${this.measurementId}&api_secret=${this.apiSecret}`;
        try {
            const response = await fetch(url, {
                    method: 'POST',
                    body: JSON.stringify({
                        client_id: await this.getOrCreateClientId(),
                        events: [
                            {
                                name,
                                params
                            }
                        ]
                    }),
                }
            );
            this.debug && console.info(await response.text());
        } catch (e) {
            console.error('Google Analytics request failed with an exception', e);
        }
    }

    // Fire a page view event.
    async firePageViewEvent(pageLocation, pageTitle, additionalParams = {}) {
        return this.fireEvent('page_view', {
            page_title: pageTitle,
            page_location: pageLocation,
            ...additionalParams
        });
    }
}

const singleton = new Agent(credentials?.measurementId, credentials?.apiSecret);
export default singleton;
