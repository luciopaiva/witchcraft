
import assert from "assert";
import { describe, it } from "mocha";
import {script} from "../../chrome-extension/script/index.js";
import {EXT_CSS, EXT_JS} from "../../chrome-extension/path/index.js";
import sinon from "sinon";

describe("Find include directive", function () {

    beforeEach(function () {
        sinon.restore();
    });

    it("empty script", function () {
        const js = "";
        const result = script.findIncludeDirective(js, EXT_JS);
        assert.strictEqual(result, undefined);
    });

    it("no directive", function () {
        const js = `
          // foo
          let x = 10;
        `;
        const result = script.findIncludeDirective(js, EXT_JS);
        assert.strictEqual(result, undefined);
    });

    it("single line comment, bare JS include", function () {
        const js = `
          // @include my-script.js
          let x = 10;
        `;
        const result = script.findIncludeDirective(js, EXT_JS);
        assert.strictEqual(result.startIndex, 11);
        assert.strictEqual(result.endIndex, 35);
        assert.strictEqual(result.script.path, "my-script.js");
        assert.strictEqual(result.script.type, EXT_JS);
    });

    it("single line comment after code, bare JS include", function () {
        const js = `let x = 10; // @include my-script.js`;
        const result = script.findIncludeDirective(js, EXT_JS);
        assert.strictEqual(result.startIndex, 12);
        assert.strictEqual(result.endIndex, 36);
        assert.strictEqual(result.script.path, "my-script.js");
        assert.strictEqual(result.script.type, EXT_JS);
    });

    it("single line comment, bare remote JS include", function () {
        const js = `
          // @include https://raw.githubusercontent.com/luciopaiva/foo/master/bar.js
          let x = 10;
        `;
        const result = script.findIncludeDirective(js, EXT_JS);
        assert.strictEqual(result.startIndex, 11);
        assert.strictEqual(result.endIndex, 85);
        assert.strictEqual(result.script.path, "https://raw.githubusercontent.com/luciopaiva/foo/master/bar.js");
        assert.strictEqual(result.script.type, EXT_JS);
    });

    it("multi line comment, bare JS include", function () {
        const js = `
          /* @include my-script.js */
          let x = 10;
        `;
        const result = script.findIncludeDirective(js, EXT_JS);
        assert.strictEqual(result.startIndex, 11);
        assert.strictEqual(result.endIndex, 38);
        assert.strictEqual(result.script.path, "my-script.js");
        assert.strictEqual(result.script.type, EXT_JS);
    });

    it("single line comment, quoted JS include", function () {
        const js = `
          // @include "my script.js"
          let x = 10;
        `;
        const result = script.findIncludeDirective(js, EXT_JS);
        assert.strictEqual(result.startIndex, 11);
        assert.strictEqual(result.endIndex, 37);
        assert.strictEqual(result.script.path, "my script.js");
        assert.strictEqual(result.script.type, EXT_JS);
    });

    it("multi line comment, quoted JS include", function () {
        const js = `
          /* @include "my script.js" */
          let x = 10;
        `;
        const result = script.findIncludeDirective(js, EXT_JS);
        assert.strictEqual(result.startIndex, 11);
        assert.strictEqual(result.endIndex, 40);
        assert.strictEqual(result.script.path, "my script.js");
        assert.strictEqual(result.script.type, EXT_JS);
    });

    it("bare CSS include", function () {
        const js = `
          a {}
          /* @include my-script.css */
          body {
            background-color: black;
          }
        `;
        const result = script.findIncludeDirective(js, EXT_CSS);
        assert.strictEqual(result.startIndex, 26);
        assert.strictEqual(result.endIndex, 54);
        assert.strictEqual(result.script.path, "my-script.css");
        assert.strictEqual(result.script.type, EXT_CSS);
    });

    it("quoted CSS include", function () {
        const js = `
          a {}
          /* @include "my script.css" */
          body {
            background-color: black;
          }
        `;
        const result = script.findIncludeDirective(js, EXT_JS);
        assert.strictEqual(result.startIndex, 26);
        assert.strictEqual(result.endIndex, 56);
        assert.strictEqual(result.script.path, "my script.css");
        assert.strictEqual(result.script.type, EXT_JS);
    });

    it("quoted remote CSS include", function () {
        const js = `
          a {}
          /* @include "https://raw.githubusercontent.com/luciopaiva/foo/master/bar.css" */
          body {
            background-color: black;
          }
        `;
        const result = script.findIncludeDirective(js, EXT_JS);
        assert.strictEqual(result.startIndex, 26);
        assert.strictEqual(result.endIndex, 106);
        assert.strictEqual(result.script.path, "https://raw.githubusercontent.com/luciopaiva/foo/master/bar.css");
        assert.strictEqual(result.script.type, EXT_JS);
    });
});
