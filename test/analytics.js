
const
    assert = require("assert"),
    {describe, it, setup, teardown} = require("mocha"),
    sinon = require("sinon"),
    chrome = require("sinon-chrome"),
    Analytics = require("../chrome-extension/analytics"),
    Witchcraft = require("../chrome-extension/witchcraft");

describe("Witchcraft", function () {

    const tabId = 42;
    const sampleCode = "// some javascript code";

    /** @type {Witchcraft} */
    let witchcraft;
    let sender;

    setup(function () {
        chrome.reset();  // just to be on the safe side in case we missed any teardown

        witchcraft = new Witchcraft(chrome, undefined);
        witchcraft.analytics = sinon.createStubInstance(Analytics);
        sinon.stub(witchcraft, "queryLocalServerForFile").resolves(sampleCode);

        sender = {
            tab: { id: tabId },
            frameId: 0
        };
    });

    teardown(function () {
        chrome.reset();
    });

    it("should send JavaScript hit counts", function () {
        const COUNT = 123;
        witchcraft.jsHitCount = COUNT;
        witchcraft.sendMetrics();
        assert(witchcraft.analytics.send.calledOnce);
        const call = witchcraft.analytics.send.getCall(0);
        assert(call.calledWithExactly(...Witchcraft.JS_HITS, COUNT));
    });

    it("should send CSS hit counts", function () {
        const COUNT = 456;
        witchcraft.cssHitCount = COUNT;
        witchcraft.sendMetrics();
        assert(witchcraft.analytics.send.calledOnce);
        const call = witchcraft.analytics.send.getCall(0);
        assert(call.calledWithExactly(...Witchcraft.CSS_HITS, COUNT));
    });

    it("should send error counts", function () {
        const COUNT = 5;
        witchcraft.errorCount = COUNT;
        witchcraft.sendMetrics();
        assert(witchcraft.analytics.send.calledOnce);
        const call = witchcraft.analytics.send.getCall(0);
        assert(call.calledWithExactly(...Witchcraft.ERROR_COUNTS, COUNT));
    });

    it("should send fail counts", function () {
        const COUNT = 6;
        witchcraft.failCount = COUNT;
        witchcraft.sendMetrics();
        assert(witchcraft.analytics.send.calledOnce);
        const call = witchcraft.analytics.send.getCall(0);
        assert(call.calledWithExactly(...Witchcraft.FAIL_COUNTS, COUNT));
    });

    it("should send JS include hits", function () {
        const COUNT = 1000;
        witchcraft.jsIncludesHitCount = COUNT;
        witchcraft.sendMetrics();
        assert(witchcraft.analytics.send.calledOnce);
        const call = witchcraft.analytics.send.getCall(0);
        assert(call.calledWithExactly(...Witchcraft.JS_INCLUDE_HITS, COUNT));
    });

    it("should send CSS include hits", function () {
        const COUNT = 1001;
        witchcraft.cssIncludesHitCount = COUNT;
        witchcraft.sendMetrics();
        assert(witchcraft.analytics.send.calledOnce);
        const call = witchcraft.analytics.send.getCall(0);
        assert(call.calledWithExactly(...Witchcraft.CSS_INCLUDE_HITS, COUNT));
    });

    it("should send JS includes not found", function () {
        const COUNT = 2000;
        witchcraft.jsIncludesNotFoundCount = COUNT;
        witchcraft.sendMetrics();
        assert(witchcraft.analytics.send.calledOnce);
        const call = witchcraft.analytics.send.getCall(0);
        assert(call.calledWithExactly(...Witchcraft.JS_INCLUDES_NOT_FOUND, COUNT));
    });

    it("should send CSS includes not found", function () {
        const COUNT = 2001;
        witchcraft.cssIncludesNotFoundCount = COUNT;
        witchcraft.sendMetrics();
        assert(witchcraft.analytics.send.calledOnce);
        const call = witchcraft.analytics.send.getCall(0);
        assert(call.calledWithExactly(...Witchcraft.CSS_INCLUDES_NOT_FOUND, COUNT));
    });
});
