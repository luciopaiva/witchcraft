import assert from "node:assert";
import {describe, it, beforeEach} from "mocha";
import sinon from "sinon";
import {loader} from "../../chrome-extension/loader.js";
import {EXT_CSS, EXT_JS} from "../../chrome-extension/path.js";
import {browser} from "../../chrome-extension/browser/index.js";

describe("Inject script", function () {

    beforeEach(function () {
        sinon.restore();
    });

    const tabUrl = "https://bar.com";
    const tabId = 10;
    const frameId = 20;

    [EXT_JS, EXT_CSS].forEach(type => {
        const script = {
            type: type,
            url: "https://foo.com",
            contents: "/** foo **/",
        };

        it(`inject ${type}`, async function () {
            await runTest({
                injectJs: sinon.fake(),
                injectCss: sinon.fake(),
                getTabUrl: sinon.fake.resolves(tabUrl),
            });
        });

        it(`fails to get tab URL when injecting ${type}`, async function () {
            await runTest({
                injectJs: sinon.fake(),
                injectCss: sinon.fake(),
                // failing to get tab URL should not prevent script from loading
                getTabUrl: sinon.fake.rejects(),
            });
        });

        async function runTest(mockBrowser) {
            for (const [fn, fake] of Object.entries(mockBrowser)) {
                sinon.replace(browser, fn, fake);
            }

            await loader.injectScript(script, tabId, frameId);

            if (type === EXT_JS) {
                assert(mockBrowser.injectCss.notCalled);
                assert(mockBrowser.injectJs.calledOnce);
                assert(mockBrowser.injectJs.calledWithExactly(script.contents, tabId, frameId));
            } else if (type === EXT_CSS) {
                assert(mockBrowser.injectJs.notCalled);
                assert(mockBrowser.injectCss.calledOnce);
                assert(mockBrowser.injectCss.calledWithExactly(script.contents, tabId, frameId));
            }
            assert(mockBrowser.getTabUrl.calledOnce);
            assert(mockBrowser.getTabUrl.calledWithExactly(tabId));
        }
    });
});
