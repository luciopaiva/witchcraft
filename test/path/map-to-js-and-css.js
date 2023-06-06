
import assert from "assert";
import { describe, it } from "mocha";
import {mapToJsAndCss} from "../../chrome-extension/path/map-to-js-and-css.js";

describe("Map to JS and CSS", function () {

    it("simple path", function () {
        const result = mapToJsAndCss("foo.bar/fizz/buzz.html");
        assert.deepStrictEqual(result, [
            [ "foo.bar/fizz/buzz.html", "js" ],
            [ "foo.bar/fizz/buzz.html", "css" ]
        ]);
    });
});
