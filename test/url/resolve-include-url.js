
import assert from "assert";
import { describe, it } from "mocha";
import {resolveIncludeUrl} from "../../chrome-extension/url/resolve-include-url.js";

const origin = "https://luciopaiva.com:1234";
const queryAndFragment = "?q=true#hello";

describe("Resolve include URL", function () {

    it ("absolute path", function () {
        const url = origin + "/witchcraft/index.html" + queryAndFragment;
        const result = resolveIncludeUrl(url, "/foo/bar");
        assert.strictEqual(result, origin + "/foo/bar" + queryAndFragment);
    });

    it ("relative path", function () {
        const url = origin + "/witchcraft/index.html" + queryAndFragment;
        const result = resolveIncludeUrl(url, "foo/bar.html");
        assert.strictEqual(result, origin + "/witchcraft/foo/bar.html" + queryAndFragment);
    });

    it ("relative path with ..", function () {
        const url = origin + "/witchcraft/foo/index.html" + queryAndFragment;
        const result = resolveIncludeUrl(url, "../bar/fizz.html");
        assert.strictEqual(result, origin + "/witchcraft/bar/fizz.html" + queryAndFragment);
    });
});
