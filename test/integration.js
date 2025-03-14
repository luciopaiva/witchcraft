
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
});
