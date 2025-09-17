
import assert from "assert";
import { describe, it } from "mocha";
import sinon from "sinon";
import ScriptContext from "../../chrome-extension/script/script-context.js";
import IncludeContext from "../../chrome-extension/script/include-context.js";
import {util} from "../../chrome-extension/util/index.js";
import {script} from "../../chrome-extension/script/index.js";

describe("Expand include", function () {

    beforeEach(function () {
        sinon.restore();
    });

    it("simple expansion", function () {
        sinon.stub(util, "spliceString").returns("foo");
        const baseScript = new ScriptContext();
        const includeScript = new ScriptContext();
        const include = new IncludeContext(includeScript);
        script.expandInclude(baseScript, include);

        assert.strictEqual(baseScript.contents, "foo");
    });
});
