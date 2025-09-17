
import assert from "assert";
import { describe, it } from "mocha";
import path from "../../chrome-extension/path/index.js";
import ScriptContext from "../../chrome-extension/script/script-context.js";
import sinon from "sinon";

const { pathTupleToScriptContext } = path;

describe("Path tuple to ScriptContext", function () {

    beforeEach(function () {
        sinon.restore();
    });

    it ("simple tuple", function () {
        const result = pathTupleToScriptContext(["foo.bar/fizz/buzz.html", "js"]);
        assert.deepStrictEqual(result, new ScriptContext("foo.bar/fizz/buzz.html.js", "js"));
    });
});
