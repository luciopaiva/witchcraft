import DummyScriptServer from "./utils/dummy-script-server.js";
import {setScriptServerAddress, startBrowser, toggleDevModeOn} from "./utils/browser-test-utils.js";
import DummyWebServer from "./utils/dummy-web-server.js";

(async () => {
    const browser = await startBrowser(false);

    const dummyWebServer = new DummyWebServer();
    await dummyWebServer.start();
    dummyWebServer.addPage("/hello.html", "<html><body><h1>Hello World</h1></body></html>");

    const dummyScriptServer = new DummyScriptServer();
    await dummyScriptServer.start();
    // dummyScriptServer.addScript("/_global.js", "console.log('Global script loaded');");
    dummyScriptServer.addScript("/_global.js", `
        document.querySelector('h1').innerText = "Goodbye World";
    `);

    await toggleDevModeOn(browser);

    // Set the server address in local storage
    await setScriptServerAddress(browser, `http://127.0.0.1:${dummyScriptServer.port}`);

    // const popUpPage = await browser.newPage()
    // await popUpPage.setViewport({width: 1000, height: 800});
    // await popUpPage.goto(`chrome-extension://${EXTENSION_ID}/popup/popup.html`)

    const helloPage = await browser.newPage()
    // await helloPage.goto(`http://127.0.0.1:${dummyWebServer.port}/hello.html`)
    await helloPage.goto(`http://foo.bar:${dummyWebServer.port}/hello.html`)

    await new Promise(() => {}); // Keeps the browser open indefinitely
    await browser.close()
})()
