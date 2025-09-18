
const FETCH_OPTIONS = {
    cache: "no-store",
};

export const FETCH_RESPONSE_OUTCOME = {
    SUCCESS: 0,
    NOT_FOUND: 1,
    SERVER_FAILURE: 2,
    FETCH_FAILURE: 3,
};

class FetchResponse {
    /** @type {string} */
    contents;
    /** @type {number} */
    outcome;
}

/**
 * @param {string} url
 * @param {Function} fetchFn
 * @returns {Promise<FetchResponse>}
 */
export async function fetchScript(url, fetchFn = fetch) {
    const result = new FetchResponse();
    try {
        const response = await fetchFn(url, FETCH_OPTIONS);
        switch (response.status) {
            case 200:
                result.contents = await response.text();
                result.outcome = FETCH_RESPONSE_OUTCOME.SUCCESS;
                break;
            case 404:
                result.outcome = FETCH_RESPONSE_OUTCOME.NOT_FOUND;
                break;
            default:
                result.outcome = FETCH_RESPONSE_OUTCOME.SERVER_FAILURE;
        }
    } catch (e) {
        result.outcome = FETCH_RESPONSE_OUTCOME.FETCH_FAILURE;
    }
    return result;
}
