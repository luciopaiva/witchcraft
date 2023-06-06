
import assert from "assert";
import { describe, it } from "mocha";
import { iteratePathSegments } from "../../chrome-extension/path/iterate-path-segments.js";

describe("Iterate path segments", function () {

    it ("empty string", function () {
        const segments = [...iteratePathSegments("")];
        assert.strictEqual(segments.length, 0);
    });

    it ("undefined", function () {
        const segments = [...iteratePathSegments(undefined)];
        assert.strictEqual(segments.length, 0);
    });

    it ("empty path", function () {
        const segments = [...iteratePathSegments("/")];
        assert.strictEqual(segments.length, 0);
    });

    it ("empty path with duplicated slashes", function () {
        const segments = [...iteratePathSegments("//")];
        assert.strictEqual(segments.length, 0);
    });

    it ("regular path", function () {
        const segments = [...iteratePathSegments("/foo/bar/index.html")];
        assert.deepStrictEqual(segments, [
            "/foo",
            "/foo/bar",
            "/foo/bar/index.html",
        ]);
    });

    it ("trailing slash", function () {
        const segments = [...iteratePathSegments("/foo/bar/")];
        assert.deepStrictEqual(segments, [
            "/foo",
            "/foo/bar",
        ]);
    });

    it ("duplicated slashes", function () {
        const segments = [...iteratePathSegments("//foo/bar///index.html")];
        assert.deepStrictEqual(segments, [
            "/foo",
            "/foo/bar",
            "/foo/bar/index.html",
        ]);
    });
});
