import {describe, it} from "mocha";
import DummyWebServer from './utils/dummy-web-server.js';
import DummyScriptServer from './utils/dummy-script-server.js';
import {setScriptServerAddress, startBrowser, toggleDevModeOn, toggleUserScripts} from "./utils/browser-test-utils.js";
import {loadResource} from "./utils/resource-utils.js";
import assert from "node:assert";
import {DEFAULT_SERVER_ADDRESS} from "../../dist/constants.js";
import {util} from "../../src/util/index.js";

const {until} = util;

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

    it("check that popup shows server status correctly", async function () {
        // Open the popup
        const popup = await browser.newPage();
        await popup.goto(`chrome-extension://hokcepcfcicnhalinladgknhaljndhpc/popup/popup.html`);

        // Wait for the server status element to be present
        await popup.waitForSelector('#server-status');

        // Wait for the server status to be updated with the 'online' class
        // This can take up to 1 second as the extension pings the server to determine status
        await popup.waitForFunction(() => {
            const serverStatusElement = document.getElementById('server-status');
            return serverStatusElement && serverStatusElement.classList.contains('online');
        }, { timeout: 5000 });

        // Double-check that the element has the online class
        const hasOnlineClass = await popup.evaluate(() => {
            const serverStatusElement = document.getElementById('server-status');
            return serverStatusElement.classList.contains('online');
        });

        assert.strictEqual(hasOnlineClass, true, "Server status should have the 'online' class when server is running");
    });

    it("check that popup lists all loaded scripts", async function () {
        webServer.addPage("/hello.html", "<html><body><h1>Hello World</h1></body></html>");

        scriptsServer.addScript("/foo.bar.js", () => "");
        scriptsServer.addScript("/bar.js", () => "");
        scriptsServer.addScript("/foo.bar.css", () => "")

        const page = await browser.newPage();
        await page.goto(`http://foo.bar:${webServer.port}/hello.html`);

        // Get the tab ID by querying Chrome tabs API from extension context
        const popup = await browser.newPage();
        await popup.goto(`chrome-extension://hokcepcfcicnhalinladgknhaljndhpc/popup/popup.html`);

        // Get the tab ID of our test page using Chrome tabs API
        const activeTabId = await popup.evaluate(async (testUrl) => {
            return new Promise(resolve => {
                chrome.tabs.query({}, tabs => {
                    const testTab = tabs.find(tab => tab.url === testUrl);
                    resolve(testTab ? testTab.id : null);
                });
            });
        }, `http://foo.bar:${webServer.port}/hello.html`);

        // Now reload the popup with the correct tab ID
        await popup.goto(`chrome-extension://hokcepcfcicnhalinladgknhaljndhpc/popup/popup.html?activeTabId=${activeTabId}`);

        await popup.waitForSelector('#scripts-table');
        const scripts = await popup.$$eval('#scripts-table tr:not(.page-frame)', rows => {
            return rows.map(row => {
                const cells = row.querySelectorAll('td');
                return {
                    name: cells[0]?.innerText,
                    type: cells[1]?.innerText
                };
            });
        });
        assert.strictEqual(scripts.length, 3, "There should be 3 scripts listed in the popup");

        // Sort scripts by name to make the test order-independent
        const sortedScripts = scripts.sort((a, b) => a.name.localeCompare(b.name));
        const expectedScripts = [
            {name: "bar.js", type: "JS"},
            {name: "foo.bar.css", type: "CSS"},
            {name: "foo.bar.js", type: "JS"}
        ];

        assert.deepStrictEqual(sortedScripts, expectedScripts, "Scripts should be listed correctly in the popup");
    });

    it("check that popup loads server address correctly", async function () {
        const page = await browser.newPage();
        await page.goto(`chrome-extension://hokcepcfcicnhalinladgknhaljndhpc/popup/popup.html`);

        await page.waitForSelector('#server-address');

        const inputValue = await page.$eval('#server-address', input => input.value);

        // check that the popup is showing the correct server address

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

        // check that changes in the server address are reflected in the popup

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

        // now check that the reset button works

        await page.click('#server-address-reset');

        // wait until the input value is reset
        await page.waitForFunction(
            (defaultAddress) => document.getElementById('server-address').value === defaultAddress,
            { timeout: 5000 },
            DEFAULT_SERVER_ADDRESS
        );

        const resetInputValue = await page.$eval('#server-address', input => input.value);
        assert.strictEqual(resetInputValue, DEFAULT_SERVER_ADDRESS);

        const resetStorageValue = await page.evaluate(() => {
            return new Promise(resolve => {
                chrome.storage.local.get('server-address', result => {
                    resolve(result['server-address']);
                });
            });
        });
        assert.strictEqual(resetStorageValue, DEFAULT_SERVER_ADDRESS);
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
        scriptsServer.addScript("/_global/hi/hello.html.js", () => document.querySelector('h1').innerText += '2');
        scriptsServer.addScript("/bar.js", () => document.querySelector('h1').innerText += '3');
        scriptsServer.addScript("/bar/hi.js", () => document.querySelector('h1').innerText += '4');
        scriptsServer.addScript("/foo.bar.js", () => document.querySelector('h1').innerText += '5');
        scriptsServer.addScript("/foo.bar/hi/hello.html.js", () => document.querySelector('h1').innerText += '6');

        const page = await browser.newPage();

        page.on('console', msg => console.log(`[CHROME CONSOLE] ${msg.type()}: ${msg.text()}`));

        await page.goto(`http://foo.bar:${webServer.port}/hi/hello.html`);

        try {
            await page.waitForFunction(
                () => document.querySelector('h1').innerText === "123456",
                { timeout: 5000 }
            );
        } catch (error) {
            if (error.name === 'TimeoutError') {
                const h1Text = await page.$eval('h1', el => el.innerText);
                throw new Error(`Test failed: expected h1 text to be "123456", but got "${h1Text}"`);
            }
        }

        const sortByPath = (a, b) => a[0].localeCompare(b[0]);

        const actual = scriptsServer.requests.filter(request => request[0] !== "/");  // ignore ping requests
        actual.sort(sortByPath); // sort requests to make the test order-independent

        const expected = [
            ["/_global.js", "HIT"],
            ["/_global.css", "MISS"],
            ["/_global/hi.js", "MISS"],
            ["/_global/hi.css", "MISS"],
            ["/_global/hi/hello.html.js", "HIT"],
            ["/_global/hi/hello.html.css", "MISS"],
            ["/bar.js", "HIT"],
            ["/bar.css", "MISS"],
            ["/bar/hi.js", "HIT"],
            ["/bar/hi.css", "MISS"],
            ["/bar/hi/hello.html.js", "MISS"],
            ["/bar/hi/hello.html.css", "MISS"],
            ["/foo.bar.js", "HIT"],
            ["/foo.bar.css", "MISS"],
            ["/foo.bar/hi.js", "MISS"],
            ["/foo.bar/hi.css", "MISS"],
            ["/foo.bar/hi/hello.html.js", "HIT"],
            ["/foo.bar/hi/hello.html.css", "MISS"],
        ].sort(sortByPath);

        assert.deepEqual(actual, expected);
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

    it("check content security policy and userScripts", async function () {
        //
        // 0. Setup
        //

        webServer.addPage("/hello.html", "<html><body><h1>Hello World</h1></body></html>");
        // Set a strict CSP policy that blocks scripts from external domains
        webServer.setCSPPolicy("script-src 'self'; object-src 'none';");
        scriptsServer.addScript("/witchcraft.js", await loadResource("test.js"));

        //
        // 1. First try to inject a script and assert it fails due to CSP
        //

        const page1 = await browser.newPage();

        page1.on('console', msg => {
            console.log(`[CHROME CONSOLE] ${msg.type()}: ${msg.text()}`);
        });

        // Collect console messages to check for CSP errors
        let gotError = false;
        page1.on("pageerror", error => {  // https://stackoverflow.com/a/59919144/778272
            console.log(`[PAGE ERROR] ${error.toString()}`);
            if (!gotError && error.toString().includes("'unsafe-eval' is not an allowed source")) {
                gotError = true;
            }
        });

        await page1.goto(`http://test.witchcraft:${webServer.port}/hello.html`);

        await until(() => gotError, 5000);

        assert(gotError, "Should have CSP violation errors in console when script is blocked");

        // Verify that the script did NOT execute (h1 should still be "Hello World")
        const h1Text = await page1.$eval('h1', el => el.innerText);
        assert.strictEqual(h1Text, "Hello World", "Script should not execute due to CSP policy");

        //
        // 2. Now allow user scripts and reload the extension
        //

        await toggleUserScripts(browser);

        //
        // 3. Try to inject the script again and assert it now succeeds
        //

        const page2 = await browser.newPage();

        page2.on('console', msg => {
            console.log(`[CHROME CONSOLE] ${msg.type()}: ${msg.text()}`);
        }).on("pageerror", error => {
            console.log(`[PAGE ERROR] ${error.toString()}`);
        });

        await page2.goto(`http://test.witchcraft:${webServer.port}/hello.html`);

        await page2.waitForFunction(
            () => document.querySelector('h1').innerText === "Goodbye World",
            { timeout: 5000 }
        );
    });
});
