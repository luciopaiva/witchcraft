
import assert from "assert";
import { describe, it } from "mocha";
import {GLOBAL_SCRIPT_NAME} from "../../chrome-extension/path/generate-potential-script-names.js";
import {path} from "../../chrome-extension/path/index.js";

const {generatePotentialScriptNames} = path;

describe("Script name generator", function () {

    it("host and path", function () {
        const levels = [...generatePotentialScriptNames("https://www.luciopaiva.com/foo/bar/index.html")];
        assert.deepStrictEqual(levels, [
            GLOBAL_SCRIPT_NAME,
            "com",
            "luciopaiva.com",
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
