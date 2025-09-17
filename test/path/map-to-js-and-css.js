
import assert from "assert";
import { describe, it } from "mocha";
import path from "../../chrome-extension/path.js";
import sinon from "sinon";

const { mapToJsAndCss } = path;

describe("Map to JS and CSS", function () {

    beforeEach(function () {
        sinon.restore();
    });

    it("simple path", function () {
        const result = mapToJsAndCss("foo.bar/fizz/buzz.html");
        assert.deepStrictEqual(result, [
            [ "foo.bar/fizz/buzz.html", "js" ],
            [ "foo.bar/fizz/buzz.html", "css" ]
        ]);
    });
});
