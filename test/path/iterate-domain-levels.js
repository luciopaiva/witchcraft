
import assert from "assert";
import { describe, it } from "mocha";
import {iterateDomainLevels} from "../../chrome-extension/path/iterate-domain-levels.js";

describe("Iterate domain levels", function () {

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

    it("empty domain", function () {
        const levels = [...iterateDomainLevels("")];
        assert.strictEqual(levels.length, 0);
    });

    it("undefined domain", function () {
        const levels = [...iterateDomainLevels(undefined)];
        assert.strictEqual(levels.length, 0);
    });
});
