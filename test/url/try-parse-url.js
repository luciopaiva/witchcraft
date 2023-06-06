
import assert from "assert";
import { describe, it } from "mocha";
import {tryParseUrl} from "../../chrome-extension/url/try-parse-url.js";

describe("Parse URL", function () {

    it ("Only host name", function () {
        const result = tryParseUrl("https://www.google.com");
        assert.deepStrictEqual(result, makeResponse("www.google.com", "/"));
    });

    it ("Host name and path", function () {
        const result = tryParseUrl("https://luciopaiva.com/foo/bar/");
        assert.deepStrictEqual(result, makeResponse("luciopaiva.com", "/foo/bar/"));
    });

    it ("Empty host", function () {
        const result = tryParseUrl("https://");
        assert.deepStrictEqual(result, makeResponse("", ""));
    });

    it ("No protocol", function () {
        const result = tryParseUrl("foo.com/bar");
        assert.deepStrictEqual(result, makeResponse("", ""));
    });
});

function makeResponse(hostName, pathName) {
    return { hostName, pathName };
}
