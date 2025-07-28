import {describe, it} from "mocha";
import DummyWebServer from './utils/dummy-web-server.js';
import DummyScriptServer from './utils/dummy-script-server.js';
import {setScriptServerAddress, startBrowser, toggleDevModeOn} from "./utils/browser-test-utils.js";
import {loadResource} from "./utils/resource-utils.js";
import assert from "node:assert";

describe("Integration", function () {
    let browser;
    let webServer;
    let scriptsServer;

    beforeEach(async function () {

        webServer = new DummyWebServer();
        await webServer.start();

        scriptsServer = new DummyScriptServer();
        await scriptsServer.start();

        browser = await startBrowser(true);
        await toggleDevModeOn(browser);

        await setScriptServerAddress(browser, `http://127.0.0.1:${scriptsServer.port}`);
    });

    afterEach(async function () {
        await browser.close();
        browser = undefined;

        await webServer.stop();
        webServer = undefined;

        await scriptsServer.stop();
        scriptsServer = undefined;
    });

    it.skip("can access google", async function () {
        const page = await browser.newPage()
        await page.goto('https://www.google.com/')
        const title = await page.title()

        console.log(title) // prints "Google"
    });

    it("check that popup loads server address correctly", async function () {
        const page = await browser.newPage();
        await page.goto(`chrome-extension://hokcepcfcicnhalinladgknhaljndhpc/popup/popup.html`);

        await page.waitForSelector('#server-address');

        const inputValue = await page.$eval('#server-address', input => input.value);

        const expectedAddress = `http://127.0.0.1:${scriptsServer.port}`;
        assert.strictEqual(inputValue, expectedAddress);

        const storageValue = await page.evaluate(() => {
            return new Promise(resolve => {
                chrome.storage.local.get('server-address', result => {
                    resolve(result['server-address']);
                });
            });
        });

        assert.strictEqual(storageValue, expectedAddress);

        const newAddress = "http://new.address:1234";
        await page.evaluate((address) => {
            return new Promise((resolve) => {
                chrome.storage.local.set({ 'server-address': address }, resolve);
            });
        }, newAddress);

        await page.reload();

        await page.waitForSelector('#server-address');
        const newInputValue = await page.$eval('#server-address', input => input.value);
        assert.strictEqual(newInputValue, newAddress);
    });

    it("check JavaScript injection", async function () {
        webServer.addPage("/hello.html", "<html><body><h1>Hello World</h1></body></html>");

        scriptsServer.addScript("/witchcraft.js", await loadResource("test.js"));

        const page = await browser.newPage();

        page.on('console', msg => console.log(`[CHROME CONSOLE] ${msg.type()}: ${msg.text()}`));

        await page.goto(`http://test.witchcraft:${webServer.port}/hello.html`);

        await page.waitForFunction(
            () => document.querySelector('h1').innerText === "Goodbye World",
            { timeout: 5000 }
        );
    });

    it("check CSS injection", async function () {
        webServer.addPage("/hello.html", "<html><body><h1>Hello World</h1></body></html>");

        scriptsServer.addScript("/witchcraft.css", await loadResource("test.css"));

        const page = await browser.newPage();

        page.on('console', msg => console.log(`[CHROME CONSOLE] ${msg.type()}: ${msg.text()}`));

        await page.goto(`http://test.witchcraft:${webServer.port}/hello.html`);

        await page.waitForFunction(
            () => window.getComputedStyle(document.querySelector('h1')).color === "rgb(0, 0, 255)",
            { timeout: 5000 }
        );
    });

    it("check if all scripts are loaded and in order", async function () {
        webServer.addPage("/hi/hello.html", "<html><body><h1>Hello World</h1></body></html>");

        scriptsServer.addScript("/_global.js", () => document.querySelector('h1').innerText = '1');
        scriptsServer.addScript("/bar.js", () => document.querySelector('h1').innerText += '2');
        scriptsServer.addScript("/foo.bar.js", () => document.querySelector('h1').innerText += '3');
        scriptsServer.addScript("/foo.bar/hi/hello.html.js", () => document.querySelector('h1').innerText += '4');

        const page = await browser.newPage();

        page.on('console', msg => console.log(`[CHROME CONSOLE] ${msg.type()}: ${msg.text()}`));

        await page.goto(`http://foo.bar:${webServer.port}/hi/hello.html`);

        await page.waitForFunction(
            () => document.querySelector('h1').innerText === "1234",
            { timeout: 5000 }
        );

        assert(scriptsServer.requests.toString(), [
            "/_global.js,HIT",
            "/_global.css,MISS",
            "/bar.js,HIT",
            "/bar.css,MISS",
            "/foo.bar.js,HIT",
            "/foo.bar.css,MISS",
            "/foo.bar/hi.js,MISS",
            "/foo.bar/hi.css,MISS",
            "/foo.bar/hi/hello.html.js,HIT",
            "/foo.bar/hi/hello.html.css,MISS"
        ].join(","));
    });

    it("check script loaded in iframe", async function () {
        webServer.addPage("/iframe.html", "<html><body>Burn the witch!</body></html>");
        webServer.addPage("/hello.html", '<html><body><iframe src="iframe.html"></iframe></body></html>');

        scriptsServer.addScript("/foo.bar/iframe.html.js", () => {
            document.querySelector('body').innerText = 'Save the witch!';
        });

        const page = await browser.newPage();

        page.on('console', msg => console.log(`[CHROME CONSOLE] ${msg.type()}: ${msg.text()}`));

        await page.goto(`http://foo.bar:${webServer.port}/hello.html`);

        const iframeElement = await page.waitForSelector('iframe');
        const frame = await iframeElement.contentFrame();

        await frame.waitForFunction(
            () => document.querySelector('body').innerText === "Save the witch!",
            { timeout: 5000 }
        );
    });

    it.skip("can load web page", async function () {
        const page = await browser.newPage();
        await page.goto(`http://localhost:${webServer.port}`);
        const content = await page.content();

        if (!content.includes("Hello, World!")) {
            throw new Error("Page content does not match expected output");
        }
    });

    it.skip("can load script", async function () {
        const page = await browser.newPage();
        await page.goto(`http://localhost:${scriptsServer.port}`);
        const content = await page.content();

        if (!content.includes("OK")) {
            throw new Error("Script server response does not match expected output");
        }
    });

    it.skip("can change the server address", async function () {
        const targets = await browser.targets();
        const extensionTarget = targets.find(target => target.type() === 'background_page' || target.type() === 'service_worker');
        const client = await extensionTarget.createCDPSession();
        await client.send('Runtime.evaluate', {
            expression: `browser.storage.local.set({ "server-address": "http://localhost:${scriptsServer.port}" })`,
        });
    });
});
