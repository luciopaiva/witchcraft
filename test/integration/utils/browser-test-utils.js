/**
 * Browser-related utility functions for integration testing
 */

/**
 * Toggles developer mode on in Chrome extensions page
 * @param {puppeteer.Browser} browser - The Puppeteer browser instance
 */
export async function toggleDevModeOn(browser) {
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
