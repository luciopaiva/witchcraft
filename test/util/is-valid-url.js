
import assert from "assert";
import { describe, it } from "mocha";
import {util} from "../../chrome-extension/util/index.js";
import sinon from "sinon";

describe("Is valid URL", function () {

    beforeEach(function () {
        sinon.restore();
    });

    it("valid URL", async function () {
        assert.ok(util.isValidUrl("https://foo.com"));
    });

    it("Chrome extension URL", async function () {
        assert.ok(!util.isValidUrl("chrome-extension://foo"));
    });
});
