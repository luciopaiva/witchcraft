
import assert from "assert";
import { describe, it } from "mocha";
import {GLOBAL_SCRIPT_NAME} from "../../chrome-extension/path/index.js";
import path from "../../chrome-extension/path/index.js";
import sinon from "sinon";

const {generatePotentialScriptNames} = path;

describe("Script name generator", function () {

    beforeEach(function () {
        sinon.restore();
    });

    it("host and path", function () {
        const levels = [...generatePotentialScriptNames("https://www.luciopaiva.com/foo/bar/index.html")];
        assert.deepStrictEqual(levels, [
            GLOBAL_SCRIPT_NAME,
            `${GLOBAL_SCRIPT_NAME}/foo`,
            `${GLOBAL_SCRIPT_NAME}/foo/bar`,
            `${GLOBAL_SCRIPT_NAME}/foo/bar/index.html`,
            "com",
            `com/foo`,
            `com/foo/bar`,
            `com/foo/bar/index.html`,
            "luciopaiva.com",
            `luciopaiva.com/foo`,
            `luciopaiva.com/foo/bar`,
            `luciopaiva.com/foo/bar/index.html`,
            "www.luciopaiva.com",
            "www.luciopaiva.com/foo",
            "www.luciopaiva.com/foo/bar",
            "www.luciopaiva.com/foo/bar/index.html",
        ]);
    });

    it("only host", function () {
        const levels = [...generatePotentialScriptNames("https://www.luciopaiva.com")];
        assert.deepStrictEqual(levels, [
            GLOBAL_SCRIPT_NAME,
            "com",
            "luciopaiva.com",
            "www.luciopaiva.com",
        ]);
    });

    it("empty host", function () {
        const levels = [...generatePotentialScriptNames("")];
        assert.deepStrictEqual(levels, [
            GLOBAL_SCRIPT_NAME,
        ]);
    });
});
