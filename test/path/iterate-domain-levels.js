
import assert from "assert";
import { describe, it } from "mocha";
import path from "../../chrome-extension/path.js";
import sinon from "sinon";

const iterateDomainLevels = path.iterateDomainLevels;

describe("Iterate domain levels", function () {

    beforeEach(function () {
        sinon.restore();
    });

    it("one-level domain", function () {
        const levels = [...iterateDomainLevels("foo")];
        assert.deepStrictEqual(levels, [
            "foo"
        ]);
    });

    it("two-level domain", function () {
        const levels = [...iterateDomainLevels("luciopaiva.com")];
        assert.deepStrictEqual(levels, [
            "com", "luciopaiva.com"
        ]);
    });

    it("three-level domain", function () {
        const levels = [...iterateDomainLevels("www.google.com")];
        assert.deepStrictEqual(levels, [
            "com", "google.com", "www.google.com"
        ]);
    });

    it("IP address", function () {
        const levels = [...iterateDomainLevels("10.0.1.2")];
        assert.deepStrictEqual(levels, [
            "2", "1.2", "0.1.2", "10.0.1.2"
        ]);
    });

    it("empty domain", function () {
        const levels = [...iterateDomainLevels("")];
        assert.strictEqual(levels.length, 0);
    });

    it("undefined domain", function () {
        const levels = [...iterateDomainLevels(undefined)];
        assert.strictEqual(levels.length, 0);
    });
});
