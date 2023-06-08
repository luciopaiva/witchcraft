import {injectJs} from "./inject-js.js";
import {injectCss} from "./inject-css.js";
import {getTabUrl} from "./get-tab-url.js";

export const chromeApi = {
    chrome: () => chrome,  // for mocking purposes
    getTabUrl,
    injectCss,
    injectJs,
};
