
import assert from "assert";
import { describe, it } from "mocha";
import {loader} from "../../chrome-extension/loader.js";
import {script} from "../../chrome-extension/script/index.js";
import sinon from "sinon";
import {analytics} from "../../chrome-extension/analytics/index.js";
import {util} from "../../chrome-extension/util/index.js";
import {FETCH_RESPONSE_OUTCOME} from "../../chrome-extension/util/fetch-script.js";
import {EXT_CSS, EXT_JS} from "../../chrome-extension/path/map-to-js-and-css.js";

const {ScriptContext} = script;
const {Metrics} = analytics;

describe("Load single script", function () {

    const SAMPLE_CONTENT = "let x = 1;";
    const SAMPLE_URL = "https://foo.bar";

    const testCase1 = {
        scriptType: EXT_JS,
        outcome: FETCH_RESPONSE_OUTCOME.SUCCESS,
        didLoad: true,
        jsHitCount: 1,
        cssHitCount: 0,
        errorCount: 0,
        failCount: 0,
    };

    const testCase2 = {
        scriptType: EXT_JS,
        outcome: FETCH_RESPONSE_OUTCOME.SERVER_FAILURE,
        didLoad: false,
        jsHitCount: 0,
        cssHitCount: 0,
        errorCount: 1,
        failCount: 0,
    };

    const testCase3 = {
        scriptType: EXT_JS,
        outcome: FETCH_RESPONSE_OUTCOME.FETCH_FAILURE,
        didLoad: false,
        jsHitCount: 0,
        cssHitCount: 0,
        errorCount: 0,
        failCount: 1,
    };

    const testCase4 = {
        scriptType: EXT_CSS,
        outcome: FETCH_RESPONSE_OUTCOME.SUCCESS,
        didLoad: true,
        jsHitCount: 0,
        cssHitCount: 1,
        errorCount: 0,
        failCount: 0,
    };

    beforeEach(function () {
        sinon.restore();
    });

    [testCase1, testCase2, testCase3, testCase4].forEach(testCase => {
        it(`simple load, type ${testCase.scriptType}, outcome ${testCase.outcome}`, async function () {
            sinon.stub(util, "fetchScript").returns({
                outcome: testCase.outcome,
                contents: SAMPLE_CONTENT,
            });
            sinon.stub(script, "processIncludeDirective");
            sinon.stub(script, "expandInclude");
            sinon.stub(script, "findIncludeDirective");
            const loadIncludes = sinon.stub(loader, "loadIncludes");

            const ctx = new ScriptContext("/foo/bar", testCase.scriptType);
            ctx.url = SAMPLE_URL;
            const metrics = new Metrics();
            const visitedUrls = new Set();

            await loader.loadSingleScript(ctx, metrics, visitedUrls);

            assert.strictEqual(visitedUrls.size, 1);
            assert.strictEqual([...visitedUrls.values()][0], SAMPLE_URL);
            assert.strictEqual(ctx.hasContents, testCase.didLoad);
            assert.strictEqual(ctx.contents, testCase.didLoad ? SAMPLE_CONTENT : undefined);
            assert.strictEqual(metrics.jsHitCount, testCase.jsHitCount);
            assert.strictEqual(metrics.cssHitCount, testCase.cssHitCount);
            assert.strictEqual(metrics.errorCount, testCase.errorCount);
            assert.strictEqual(metrics.failCount, testCase.failCount);
            if (testCase.didLoad) {
                sinon.assert.calledOnce(loadIncludes);
            } else {
                sinon.assert.notCalled(loadIncludes);
            }
        });
    });
});
