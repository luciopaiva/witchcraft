
import puppeteer from 'puppeteer';
import {describe, it} from "mocha";

const EXTENSION_PATH = "./chrome-extension";
const EXTENSION_ID = "hokcepcfcicnhalinladgknhaljndhpc";

describe("Integration", function () {
    let browser;

    beforeEach(async function () {
        browser = await puppeteer.launch({
            headless: false,
            args: [
                `--disable-extensions-except=${EXTENSION_PATH}`,
                `--load-extension=${EXTENSION_PATH}`,
            ],
        });
    });

    afterEach(async function () {
        await browser.close();
        browser = undefined;
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
});
