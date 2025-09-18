
import assert from "assert";
import { describe, it } from "mocha";
import {util} from "../../src/util/index.js";
import sinon from "sinon";

describe("Splice string", function () {

    beforeEach(function () {
        sinon.restore();
    });

    it("simple splice", async function () {
        const result = util.spliceString("foobarfoo", 3, 6, "foo");
        assert.strictEqual(result, "foofoofoo");
    });

    it("replace with larger string", async function () {
        const result = util.spliceString("foobarfoo", 3, 6, "hello");
        assert.strictEqual(result, "foohellofoo");
    });

    it("replace entire string", async function () {
        const result = util.spliceString("foobarfoo", 0, 9, "hello");
        assert.strictEqual(result, "hello");
    });

    it("replace with empty", async function () {
        const result = util.spliceString("foobarfoo", 3, 6, "");
        assert.strictEqual(result, "foofoo");
    });

    it("no operation", async function () {
        const result = util.spliceString("foobarfoo", 5, 5, "");
        assert.strictEqual(result, "foobarfoo");
    });

    it("append", async function () {
        const result = util.spliceString("foo", 3, 3, "bar");
        assert.strictEqual(result, "foobar");
    });
});
