/**
 * Browser-related utility functions for integration testing
 */
import puppeteer from "puppeteer";

const EXTENSION_PATH = "./dist";
const EXTENSION_ID = "hokcepcfcicnhalinladgknhaljndhpc";

export async function startBrowser(headless = true) {
    return await puppeteer.launch({
        headless: headless,
        args: [
            `--disable-extensions-except=${EXTENSION_PATH}`,
            `--load-extension=${EXTENSION_PATH}`,
            "--enable-extension-developer-mode",
            "--host-resolver-rules=MAP * 127.0.0.1",  // this allows tests to fake requests to various domains
            "--no-sandbox",  // necessary to run in Docker
        ],
    });
}

/**
 * Toggles developer mode on in Chrome extensions page
 * @param {puppeteer.Browser} browser - The Puppeteer browser instance
 */
export async function toggleDevModeOn(browser) {
    // taken from https://github.com/puppeteer/puppeteer/issues/5095#issuecomment-590292518
    const [chromeExtensionsTab] = await browser.pages();
    // const chromeExtensionsTab = await browser.newPage();

    await chromeExtensionsTab.goto("chrome://extensions");
    await chromeExtensionsTab.waitForSelector("body > extensions-manager");
    const devModeToggle = await chromeExtensionsTab.evaluateHandle(
        'document.querySelector("body > extensions-manager").shadowRoot.querySelector("extensions-toolbar").shadowRoot.querySelector("#devMode")'
    );
    await devModeToggle.click();
    console.info(`DevMode Toggled on`);

    await new Promise(resolve => setTimeout(resolve, 1000));
}

export async function setScriptServerAddress(browser, serverAddress) {
    // const targets = await browser.targets();
    // const extensionTarget = targets.find(target => target.type() === 'background_page' || target.type() === 'service_worker');
    // const client = await extensionTarget.createCDPSession();
    // await client.send('Runtime.evaluate', {
    //     expression: `browser.storage.local.set({ "server-address": "${serverAddress}" })`,
    // });

    // Open the extension popup to access its chrome.storage context
    const extensionPage = await browser.newPage();
    await extensionPage.goto(`chrome-extension://${EXTENSION_ID}/popup/popup.html`);

    // Set the server-address using Chrome Extensions storage API
    await extensionPage.evaluate((address) => {
        return new Promise((resolve) => {
            chrome.storage.local.set({ 'server-address': address }, resolve);
        });
    }, serverAddress);

    await extensionPage.close();
}

export async function toggleUserScripts(browser) {
    const extPage = await browser.newPage();
    await extPage.goto(`chrome://extensions/?id=${EXTENSION_ID}`);

    await extPage.waitForSelector("body > extensions-manager");
    const userScriptsToggle = await extPage.evaluateHandle(
        'document.querySelector("body > extensions-manager").shadowRoot.querySelector("#viewManager > extensions-detail-view").shadowRoot.querySelector("#allow-user-scripts").shadowRoot.querySelector("#crToggle")'
    );
    await userScriptsToggle.click();
}
