import puppeteer from 'puppeteer';
import {describe, it} from "mocha";
import DummyWebServer from './dummy-web-server.js';
import DummyScriptServer from './dummy-script-server.js';

const EXTENSION_PATH = "./chrome-extension";
const EXTENSION_ID = "hokcepcfcicnhalinladgknhaljndhpc";

describe("Integration", function () {
    let browser;
    let dummyServer;
    let dummyScriptServer;

    beforeEach(async function () {
        browser = await puppeteer.launch({
            // headless: false,
            args: [
                `--disable-extensions-except=${EXTENSION_PATH}`,
                `--load-extension=${EXTENSION_PATH}`,
            ],
        });

        dummyServer = new DummyWebServer();
        await dummyServer.start();

        dummyScriptServer = new DummyScriptServer();
        await dummyScriptServer.start();
    });

    afterEach(async function () {
        await browser.close();
        browser = undefined;

        await dummyServer.stop();
        dummyServer = undefined;

        await dummyScriptServer.stop();
        dummyScriptServer = undefined;
    });

    it("can access google", async function () {
        const page = await browser.newPage()
        await page.goto('https://www.google.com/')
        const title = await page.title()

        console.log(title) // prints "Google"
    });

    it("can open popup", async function () {
        const page = await browser.newPage();
        await page.goto(`chrome-extension://${EXTENSION_ID}/popup/popup.html`);
    });

    it("can inject script", async function () {
        // maybe this should be in the before test setup
        // ToDo setup dummy page server
        // ToDo setup dummy scripts server

        // this should be the actual content of this test
        // ToDo open dummy page
        // ToDo look for script effects

        // maybe the following should be a separate
        // ToDo open popup
        // ToDo check that it shows the list of scripts

        // other test
        // ToDo verify that the popup shows red LED when the server is down
        // ToDo verify that the popup shows green LED when the server is up
    });

    it("can load web page", async function () {
        const page = await browser.newPage();
        await page.goto(`http://localhost:${dummyServer.port}`);
        const content = await page.content();

        if (!content.includes("Hello, World!")) {
            throw new Error("Page content does not match expected output");
        }
    });

    it("can load script", async function () {
        const page = await browser.newPage();
        await page.goto(`http://localhost:${dummyScriptServer.port}`);
        const content = await page.content();

        if (!content.includes("OK")) {
            throw new Error("Script server response does not match expected output");
        }
    });

    it("can change the server address", async function () {
        const targets = await browser.targets();
        const extensionTarget = targets.find(target => target.type() === 'background_page' || target.type() === 'service_worker');
        const client = await extensionTarget.createCDPSession();
        await client.send('Runtime.evaluate', {
            expression: `browser.storage.local.set({ "server-address": "http://localhost:${dummyScriptServer.port}" })`,
        });
    });
});
