import assert from "assert";
import { describe, it } from "mocha";
import {util} from "../../chrome-extension/util/index.js";
import sinon from "sinon";

describe("Base 64 / Typed Array conversion", function () {

    beforeEach(function () {
        sinon.restore();
    });

    it("typed array to base 64", async function () {
        const data = new Uint8ClampedArray([1, 2, 3, 255]);
        assert.strictEqual(util.typedArrayToBase64(data), "AQID/w==");
    });

    it("base 64 to Uint8ClampedArray", async function () {
        const base64 = "AQID/w==";
        const data = util.base64ToTypedArray(base64, Uint8ClampedArray);
        assert.strictEqual(data.toString(), "1,2,3,255");
    });

    it("base 64 to Int8Array", async function () {
        const base64 = "AQID/w==";
        const data = util.base64ToTypedArray(base64, Int8Array);
        assert.strictEqual(data.toString(), "1,2,3,-1");
    });
});
