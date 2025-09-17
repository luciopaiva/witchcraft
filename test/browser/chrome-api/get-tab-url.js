import assert from "node:assert";
import {describe, it} from "mocha";
import sinon from "sinon";
import {browser} from "../../../chrome-extension/browser.js";

describe("Chrome API - Get tab URL", function () {

    beforeEach(function () {
        sinon.restore();
    });

    it("successful get", async function () {
        const url = "https://foo.com";

        const chrome = {
            tabs: {
                get: sinon.fake((tabId, callback) => {
                    callback({url});
                }),
            }
        };
        sinon.replace(browser, "chrome", () => chrome);

        const tabId = 10;
        assert.strictEqual(await browser.getTabUrl(tabId), url);
        assert(chrome.tabs.get.calledWith(tabId));
    });

    it("resolved with runtime error", async function () {
        const url = "https://foo.com";

        const chrome = {
            tabs: {
                get: sinon.fake((tabId, callback) => {
                    callback({url});
                }),
            },
            runtime: {
                lastError: {
                    message: "Something went wrong",
                }
            }
        };
        sinon.replace(browser, "chrome", () => chrome);

        const tabId = 10;
        await assert.rejects(async () => {
            await browser.getTabUrl(tabId);
        });
        assert(chrome.tabs.get.calledWith(tabId));
    });

    it("failed get", async function () {
        const chrome = {
            tabs: {
                get: sinon.fake.throws(),
            }
        };
        sinon.replace(browser, "chrome", () => chrome);

        const tabId = 10;
        await assert.rejects(async () => {
            await browser.getTabUrl(tabId);
        });
        assert(chrome.tabs.get.calledWith(tabId));
    });
});
