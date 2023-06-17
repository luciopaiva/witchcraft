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
import {onInstalled} from "./on-installed.js";
import {onSuspend} from "./on-suspend.js";
import {onNewFrame} from "./on-new-frame.js";
import {getManifestVersion} from "./get-manifest-version.js";
import {createTab} from "./create-tab.js";
import {onStorageChanged} from "./on-storage-changed.js";
import {captureRuntimeError} from "./capture-runtime-error.js";
import {setBadgeText} from "./set-badge-text.js";
import {setIcon} from "./set-icon.js";
import {getFileUrl} from "./get-file-url.js";
import {clearStorage} from "./clear-storage.js";

export const chromeApi = {
    captureRuntimeError,
    chrome: () => chrome,  // for mocking purposes
    clearStorage,
    createTab,
    getActiveTabId,
    getAllFrames,
    getFileUrl,
    getFrame,
    getManifestVersion,
    getTabUrl,
    injectCss,
    injectJs,
    onInstalled,
    onNewFrame,
    onStorageChanged,
    onSuspend,
    removeKey,
    retrieveAllEntries,
    retrieveKey,
    setBadgeText,
    setIcon,
    storeKey,
};
