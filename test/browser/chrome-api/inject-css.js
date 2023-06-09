import assert from "node:assert";
import {describe, it} from "mocha";
import sinon from "sinon";
import {chromeApi} from "../../../chrome-extension/browser/chrome-api/index.js";

describe("Chrome API - Inject CSS", function () {

    beforeEach(function () {
        sinon.restore();
    });

    it("simple inject", async function () {
        const chrome = {
            tabs: {
                insertCSS: sinon.fake(),
            }
        };
        sinon.replace(chromeApi, "chrome", () => chrome);

        const contents = "/** foo **/";
        const tabId = 10;
        const frameId = 20;

        chromeApi.injectCss(contents, tabId, frameId);

        assert(chrome.tabs.insertCSS.calledWithExactly(tabId, {
            code: contents,
            frameId: frameId,
            runAt: "document_start",
        }));
    });
});
