import {injectJs} from "./inject-js.js";
import {injectCss} from "./inject-css.js";
import {getTabUrl} from "./get-tab-url.js";
import {getActiveTabId} from "./get-active-tab-id.js";
import {retrieveKey} from "./retrieve-key.js";
import {storeKey} from "./store-key.js";
import {removeKey} from "./remove-key.js";
import {retrieveAllEntries} from "./retrieve-all-entries.js";
import {getFrame} from "./get-frame.js";
import {getAllFrames} from "./get-all-frames.js";

export const chromeApi = {
    chrome: () => chrome,  // for mocking purposes
    getActiveTabId,
    getAllFrames,
    getFrame,
    getTabUrl,
    injectCss,
    injectJs,
    removeKey,
    retrieveAllEntries,
    retrieveKey,
    storeKey,
};
