import assert from "node:assert";
import {describe, it, beforeEach} from "mocha";
import sinon from "sinon";
import {loader} from "../../chrome-extension/loader/index.js";
import {EXT_CSS, EXT_JS} from "../../chrome-extension/path/map-to-js-and-css.js";
import {browser} from "../../chrome-extension/browser/index.js";
import {util} from "../../chrome-extension/util/index.js";

describe("Inject script", function () {

    beforeEach(function () {
        sinon.restore();
    });

    [EXT_JS, EXT_CSS].forEach(type => {
        it(`inject ${type}`, async function () {
            const tabUrl = "https://bar.com";
            const mockBrowser = {
                injectJs: sinon.fake(),
                injectCss: sinon.fake(),
                getTabUrl: sinon.fake.resolves(tabUrl),
            };
            sinon.replace(browser, "api", mockBrowser);

            const script = {
                type: type,
                url: "https://foo.com",
                contents: "/** foo **/",
            };
            const tabId = 10;
            const frameId = 20;
            await loader.injectScript(script, tabId, frameId);

            if (type === EXT_JS) {
                assert(mockBrowser.injectCss.notCalled);
                assert(mockBrowser.injectJs.calledOnce);
                assert(mockBrowser.injectJs.calledWithExactly(util.embedScript(script.contents), tabId, frameId));
            } else if (type === EXT_CSS) {
                assert(mockBrowser.injectJs.notCalled);
                assert(mockBrowser.injectCss.calledOnce);
                assert(mockBrowser.injectCss.calledWithExactly(script.contents, tabId, frameId));
            }
            assert(mockBrowser.getTabUrl.calledOnce);
            assert(mockBrowser.getTabUrl.calledWithExactly(tabId));
        });
    });
});
