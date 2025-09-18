import {beforeEach} from "mocha";
import sinon from "sinon";
import {storage} from "../../src/storage/index.js";
import {browser} from "../../src/browser.js";
import assert from "node:assert";

describe("Frame data storage", function () {

    beforeEach(function () {
        sinon.restore();
    });

    it("retrieve data from specific frame in tab", async function () {
        const tabId = 123;
        const frameId = 0;

        sinon.replace(browser, "retrieveKey", sinon.fake.resolves({
            tabId,
            frameId,
            scripts: JSON.stringify(["script1.js", "script2.js"]),
        }));

        const result = await storage.retrieveFrame(tabId, frameId);

        sinon.assert.calledOnce(browser.retrieveKey);
        sinon.assert.calledWithExactly(browser.retrieveKey, "frame-scripts:123:0");
        assert.deepStrictEqual(result, {
            tabId,
            frameId,
            scripts: JSON.stringify(["script1.js", "script2.js"]),
        });
    });

    it("retrieve data from all frames in tab", async function () {
        const tabId = 123;

        sinon.replace(browser, "retrieveAllEntries", sinon.fake.resolves([
            ["frame-scripts:123:0", 1000],
            ["frame-scripts:123:1", 1001],
            ["frame-scripts:223:0", 1002],
        ]));

        const result = await storage.retrieveAllFrames(tabId);

        sinon.assert.calledOnce(browser.retrieveAllEntries);
        sinon.assert.calledWithExactly(browser.retrieveAllEntries);
        console.log(result);
        assert.deepStrictEqual(result, {
            "frame-scripts:123:0": 1000,
            "frame-scripts:123:1": 1001,
        });
    });
});
