import assert from "node:assert";
import {describe, it} from "mocha";
import sinon from "sinon";
import {util} from "../../../chrome-extension/util/index.js";
import {chromeApi} from "../../../chrome-extension/chrome-api/index.js";

describe("Chrome API - Inject JS", function () {

    beforeEach(function () {
        sinon.restore();
    });

    it("simple inject", async function () {
        const chrome = {
            tabs: {
                executeScript: sinon.fake(),
            }
        };
        sinon.replace(chromeApi, "chrome", () => chrome);

        const contents = "/** foo **/";
        const tabId = 10;
        const frameId = 20;

        chromeApi.injectJs(contents, tabId, frameId);

        assert(chrome.tabs.executeScript.calledWithExactly(tabId, {
            code: util.embedScript(contents),
            frameId: frameId,
            runAt: "document_start",
        }));
    });
});
