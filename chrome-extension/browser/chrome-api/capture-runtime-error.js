import {chromeApi} from "./index.js";

const IGNORED_ERRORS = new RegExp([
    "No frame with id \\d+ in tab \\d+",
    "No tab with id: \\d+",
].join("|"));

export function captureRuntimeError(logger = console) {
    const error = chromeApi.chrome().runtime?.lastError;
    if (error) {
        if (IGNORED_ERRORS.test(error.message)) {
            // frame is no longer available - nothing to worry about, just ignore
        } else {
            logger.error(JSON.stringify(error, null, 2));
        }
    }
    return !!error;
}
