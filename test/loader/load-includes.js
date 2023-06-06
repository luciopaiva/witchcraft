
import { describe, it, setup, teardown } from "mocha";
import sinon from "sinon";
import {loader} from "../../chrome-extension/loader/index.js";
import {script} from "../../chrome-extension/script/index.js";
import {analytics} from "../../chrome-extension/analytics/index.js";
import {EXT_JS} from "../../chrome-extension/path/map-to-js-and-css.js";

const {IncludeContext, ScriptContext} = script;
const {Metrics} = analytics;

describe("Load includes", function () {

    teardown(function () {
        sinon.restore();
    });

    it("no includes", function () {
        const findIncludeDirective = sinon.stub(script, "findIncludeDirective");
        const processIncludeDirective = sinon.stub(script, "processIncludeDirective");
        const expandInclude = sinon.stub(script, "expandInclude");

        const baseScript = new ScriptContext();
        const metrics = new Metrics();
        const visitedUrls = new Set();

        loader.loadIncludes(baseScript, metrics, visitedUrls);

        sinon.assert.calledOnce(findIncludeDirective);
        sinon.assert.notCalled(processIncludeDirective);
        sinon.assert.notCalled(expandInclude);
    });

    it("one include", async function () {
        const findIncludeDirective = sinon.stub(script, "findIncludeDirective");

        const includeScript = new ScriptContext("/foo/bar", EXT_JS);
        const include = new IncludeContext(includeScript, 2, 7);
        findIncludeDirective.onFirstCall().returns(include);

        const processIncludeDirective = sinon.stub(script, "processIncludeDirective");
        const expandInclude = sinon.stub(script, "expandInclude");

        const baseScript = new ScriptContext();
        const metrics = new Metrics();
        const visitedUrls = new Set();

        await loader.loadIncludes(baseScript, metrics, visitedUrls);

        sinon.assert.calledTwice(findIncludeDirective);
        sinon.assert.calledOnce(processIncludeDirective);
        sinon.assert.calledOnce(expandInclude);
    });
});
