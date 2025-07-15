import {describe, it} from "mocha";
import DummyWebServer from './utils/dummy-web-server.js';
import DummyScriptServer from './utils/dummy-script-server.js';
import {setScriptServerAddress, startBrowser, toggleDevModeOn} from "./utils/browser-test-utils.js";
import {loadResource} from "./utils/resource-utils.js";

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

        await setScriptServerAddress(browser, ` http://127.0.0.1:${scriptsServer.port}`);
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

    it.skip("can open popup", async function () {
        const page = await browser.newPage();
        await page.goto(`chrome-extension://hokcepcfcicnhalinladgknhaljndhpc/popup/popup.html`);
    });

    it("can inject script", async function () {
        webServer.addPage("/hello.html", "<html><body><h1>Hello World</h1></body></html>");

        scriptsServer.addScript("/_global.js", await loadResource("can-inject-script.js"));
            // `setInterval(() => document.querySelector('h1').innerText = "Goodbye World", 1000)`);
            // `console.info("Global script loaded")`);

        // Open the dummy page
        const page = await browser.newPage();

        // Listen for console messages and print them
        page.on('console', msg => {
            console.log(`[CHROME CONSOLE] ${msg.type()}: ${msg.text()}`);
        });

        await page.goto(`http://localhost:${webServer.port}/hello.html`);

        // Wait for the script to inject and modify the content
        await page.waitForFunction(
            () => document.querySelector('h1').innerText === "Goodbye World",
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
