import puppeteer from "puppeteer";
import DummyScriptServer from "./dummy-script-server.js";

const EXTENSION_PATH = "./chrome-extension";1
const EXTENSION_ID = "hokcepcfcicnhalinladgknhaljndhpc";

async function toggleDevModeOn(browser) {
    // taken from https://github.com/puppeteer/puppeteer/issues/5095#issuecomment-590292518
    const [chromeExtensionsTab] = await browser.pages();
    await chromeExtensionsTab.goto("chrome://extensions");
    await chromeExtensionsTab.waitForSelector("body > extensions-manager");
    const devModeToggle = await chromeExtensionsTab.evaluateHandle(
        'document.querySelector("body > extensions-manager").shadowRoot.querySelector("extensions-toolbar").shadowRoot.querySelector("#devMode")'
    );
    await devModeToggle.click();

    await new Promise(resolve => setTimeout(resolve, 1000));
}

async function setServerAddress(browser, serverAddress) {
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

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            `--disable-extensions-except=${EXTENSION_PATH}`,
            `--load-extension=${EXTENSION_PATH}`,
            "--enable-extension-developer-mode"
        ],
    });

    const dummyScriptServer = new DummyScriptServer();
    await dummyScriptServer.start();

    await toggleDevModeOn(browser);

    // Set the server address in local storage
    await setServerAddress(browser, `http://localhost:${dummyScriptServer.port}`);

    const page = await browser.newPage()
    await page.setViewport({width: 1000, height: 800});
    await page.goto(`chrome-extension://${EXTENSION_ID}/popup/popup.html`)
    const title = await page.title()

    await new Promise(() => {}); // Keeps the browser open indefinitely
    // console.log(title) // prints "Google"
    await browser.close()
})()
