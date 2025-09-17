
const NAVIGATION_FILTER = { url: [{ schemes: ["http", "https", "file", "ftp"] }] };

const IGNORED_ERRORS = new RegExp([
    "No frame with id \\d+ in tab \\d+",
    "No tab with id: \\d+",
    "Cannot access a chrome:// URL",
    "The extensions gallery cannot be scripted",  // shown when user navigates the Chrome extension store page
].join("|"));

export function captureRuntimeError(logger = console) {
    const error = browser.chrome().runtime?.lastError;
    if (error) {
        if (IGNORED_ERRORS.test(error.message)) {
            // frame is no longer available - nothing to worry about, just ignore
        } else {
            logger.error(JSON.stringify(error, null, 2));
        }
    }
    return !!error;
}

async function clearStorage() {
    return new Promise(resolve => browser.chrome().storage.local.clear(resolve));
}

async function createTab(url) {
    return new Promise(resolve => {
        browser.chrome().tabs.create({ url }, tab => resolve(tab));
    });
}

async function getActiveTabId() {
    return new Promise(resolve => {
        browser.chrome().tabs.query({ active: true, currentWindow: true }, tabs => {
            if (Array.isArray(tabs) && tabs.length > 0) {
                resolve(tabs[0].id);
            } else {
                resolve(undefined);
            }
        });
    });
}

async function getAllFrames(tabId) {
    return new Promise(resolve => {
        browser.chrome().webNavigation.getAllFrames({ tabId: tabId }, details => {
            resolve(details?.map(frame => frame.frameId) ?? []);
        });
    });
}

function getFileUrl(path) {
    return browser.chrome().runtime.getURL(path);
}

function getAppVersion() {
    return browser.chrome().runtime.getManifest().version;
}

async function getFrame(tabId, frameId) {
    return new Promise(resolve => {
        browser.chrome().webNavigation.getFrame({ tabId, frameId }, resolve);
    });
}

function getTabUrl(tabId) {
    return new Promise((resolve, reject) => {
        try {
            browser.chrome().tabs.get(tabId, details => {
                if (browser.captureRuntimeError()) {
                    reject();
                } else {
                    resolve(details?.url);
                }
            });
        } catch (e) {
            console.error(e);
            reject();
        }
    });
}

function injectCss(contents, tabId, frameId) {
    browser.chrome().scripting.insertCSS({
        css: contents,
        target: {
            tabId: tabId,
            frameIds: [frameId]
        },
    }).catch(browser.captureRuntimeError);
}

function isUserScriptsEnabled() {
    return typeof chrome?.userScripts?.execute === "function";
}

function injectJs(contents, tabId, frameId) {
    if (isUserScriptsEnabled()) {
        chrome.userScripts.execute({
            injectImmediately: true,
            target: { tabId: tabId, frameIds: [frameId] },
            js: [{
                code: contents,
            }],
            world: "MAIN"
        }).catch(browser.captureRuntimeError);
    } else {
        browser.chrome().scripting.executeScript({
            injectImmediately: true,
            target: { tabId: tabId, frameIds: [frameId] },
            func: (contents) => Function(contents)(),
            args: [contents],
            world: "MAIN"
        }).catch(browser.captureRuntimeError);
    }
}

function onCommitted(callback) {
    browser.chrome().webNavigation.onCommitted.addListener(callback, NAVIGATION_FILTER);
}

function onInstalled(callback) {
    browser.chrome().runtime.onInstalled.addListener(callback);
}

function onStorageChanged(callback) {
    browser.chrome().storage.onChanged.addListener(callback);
    return () => {
        browser.chrome().storage.onChanged.removeListener(callback);
    }
}

function onSuspend(callback) {
    browser.chrome().runtime.onSuspend.addListener(() => callback);
}

async function removeKey(key) {
    return new Promise(resolve => {
        browser.chrome().storage.local.remove(key, resolve);
    });
}

async function retrieveAllEntries() {
    const result = await browser.chrome().storage.local.get();
    return Object.entries(result);
}

async function retrieveKey(key) {
    return new Promise(resolve => {
        browser.chrome().storage.local.get(key, result => {
            resolve(result[key]);
        });
    });
}

async function setBadgeText(tabId, text) {
    return new Promise(resolve => {
        browser.chrome().action.setBadgeText({
            tabId,
            text,
        }, () => {
            browser.captureRuntimeError();
            resolve();
        });
    });
}

async function setIcon(imageData) {
    return new Promise(resolve => {
        browser.chrome().action.setIcon({
            imageData: imageData
        }, resolve);
    });
}

async function storeKey(key, value) {
    return new Promise(resolve => {
        const obj = {};
        obj[key] = value;
        browser.chrome().storage.local.set(obj, resolve);
    });
}

export const browser = {
    captureRuntimeError,
    chrome: () => chrome,  // for mocking purposes
    clearStorage,
    createTab,
    getActiveTabId,
    getAllFrames,
    getFileUrl,
    getFrame,
    getAppVersion,
    getTabUrl,
    injectCss,
    injectJs,
    onInstalled,
    onCommitted,
    onStorageChanged,
    onSuspend,
    removeKey,
    retrieveAllEntries,
    retrieveKey,
    setBadgeText,
    setIcon,
    storeKey,
};
