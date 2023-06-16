import {chromeApi} from "./index.js";

const ERROR_NO_FRAME_WITH_ID = /No frame with id \d+ in tab \d+/

export function captureRuntimeError() {
    const error = chromeApi.chrome().runtime?.lastError;
    if (error) {
        if (ERROR_NO_FRAME_WITH_ID.test(error.message)) {
            // frame is no longer available - nothing to worry about, just ignore
        } else {
            console.error(JSON.stringify(error, null, 2));
        }
    }
    return !!error;
}
