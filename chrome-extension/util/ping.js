import {util} from "./index.js";
import {storage} from "../storage/index.js";
import {FETCH_RESPONSE_OUTCOME} from "./fetch-script.js";

export async function ping() {
    const serverAddress = await storage.retrieveServerAddress();
    const response = await util.fetchScript(serverAddress);
    return !response || (response.outcome !== FETCH_RESPONSE_OUTCOME.FETCH_FAILURE);
}
