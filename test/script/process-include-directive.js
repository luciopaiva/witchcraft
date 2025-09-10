
import assert from "assert";
import { describe, it, setup, teardown } from "mocha";
import sinon from "sinon";
import {loader} from "../../chrome-extension/loader/index.js";
import {script} from "../../chrome-extension/script/index.js";
import Metrics from "../../chrome-extension/analytics/metrics.js";
import {url} from "../../chrome-extension/url/index.js";
import {EXT_CSS, EXT_JS} from "../../chrome-extension/path/map-to-js-and-css.js";

const IncludeContext = script.IncludeContext;
const ScriptContext = script.ScriptContext;

describe("Process include directive", function () {

    let metrics;
    let ctx;
    let include;
    let visitedUrls;

    setup(function () {
        sinon.stub(url, "composeUrl").callsFake((_, path) => "https://www.google.com" + path);

        metrics = new Metrics();
        ctx = new ScriptContext("/foo/bar", EXT_JS);
        include = new IncludeContext(ctx, 1, 2);
        visitedUrls = new Set();
    });

    teardown(function () {
        sinon.restore();
    });

    [EXT_JS, EXT_CSS].forEach(scriptType => {
        it(`unvisited ${scriptType} script`, async function () {
            ctx.type = scriptType;

            sinon.stub(loader, "loadSingleScript").callsFake((script) => {
                script.contents = "foo";
            });

            await script.processIncludeDirective(ctx, include, metrics, visitedUrls);

            assert.ok(include.script.hasContents);
            assert.strictEqual(include.script.contents, "foo");
            assert.strictEqual(metrics.jsIncludesHitCount, scriptType === EXT_JS ? 1 : 0);
            assert.strictEqual(metrics.cssIncludesHitCount, scriptType === EXT_CSS ? 1 : 0);
            assert.strictEqual(metrics.jsIncludesNotFoundCount, 0);
            assert.strictEqual(metrics.cssIncludesNotFoundCount, 0);
        });
    });

    [EXT_JS, EXT_CSS].forEach(scriptType => {
        it(`${scriptType} script not found`, async function () {
            ctx.type = scriptType;

            sinon.stub(loader, "loadSingleScript");

            await script.processIncludeDirective(ctx, include, metrics, visitedUrls);

            assert.ok(include.script.hasContents);
            assert.notStrictEqual(include.script.contents, "foo");
            assert.strictEqual(metrics.jsIncludesHitCount, 0);
            assert.strictEqual(metrics.cssIncludesHitCount, 0);
            assert.strictEqual(metrics.jsIncludesNotFoundCount, scriptType === EXT_JS ? 1 : 0);
            assert.strictEqual(metrics.cssIncludesNotFoundCount, scriptType === EXT_CSS ? 1 : 0);
        });
    });

    it("visited script", async function () {
        sinon.stub(loader, "loadSingleScript").callsFake((script) => {
            script.contents = "foo";
        });

        visitedUrls.add("https://www.google.com/foo/bar");

        await script.processIncludeDirective(ctx, include, metrics, visitedUrls);

        assert.ok(include.script.hasContents);
        assert.notStrictEqual(include.script.contents, "foo");
        assert.strictEqual(metrics.jsIncludesHitCount, 0);
        assert.strictEqual(metrics.jsIncludesNotFoundCount, 0);
    });
});
