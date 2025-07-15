import puppeteer from "puppeteer";
import DummyScriptServer from "./utils/dummy-script-server.js";
import { toggleDevModeOn } from "./utils/browser-test-utils.js";
import DummyWebServer from "./utils/dummy-web-server.js";

const EXTENSION_PATH = "./chrome-extension";
const EXTENSION_ID = "hokcepcfcicnhalinladgknhaljndhpc";

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

    const dummyWebServer = new DummyWebServer();
    await dummyWebServer.start();

    const dummyScriptServer = new DummyScriptServer();
    await dummyScriptServer.start();

    await toggleDevModeOn(browser);

    // Set the server address in local storage
    await setServerAddress(browser, `http://127.0.0.1:${dummyScriptServer.port}`);

    const popUpPage = await browser.newPage()
    await popUpPage.setViewport({width: 1000, height: 800});
    await popUpPage.goto(`chrome-extension://${EXTENSION_ID}/popup/popup.html`)
    const title = await popUpPage.title()

    const helloPage = await browser.newPage()
    await helloPage.goto(`http://127.0.0.1:${dummyWebServer.port}/hello`)

    await new Promise(() => {}); // Keeps the browser open indefinitely
    // console.log(title) // prints "Google"
    await browser.close()
})()
