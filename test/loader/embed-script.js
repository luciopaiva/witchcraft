
import vm from "node:vm";
import assert from "node:assert";
import { describe, it } from "mocha";
import sinon from "sinon";
import {loader} from "../../chrome-extension/loader/index.js";

describe("Embed script", function () {

    it("simple embed", function () {
        // step 1: prepare script to embed

        const contents = `
            window.x = 123;
        `;
        const code = loader.embedScript(contents);

        const script = {
            text: "",
        }

        // step 2: pass it to the content script execution environment

        const appendChildFn = sinon.fake();

        const document = {
            createElement: sinon.fake.returns(script),
            documentElement: {
                appendChild: appendChildFn,
            }
        };

        const context = {
            document,
        }

        // this simulates the content script execution environment injecting the script tag into the DOM
        vm.runInNewContext(code, context);

        assert(appendChildFn.calledOnce);

        // step 3: pass it to the page execution environment

        const scriptElement = appendChildFn.getCall(0).firstArg;
        const injectedCode = scriptElement.text;

        // this simulates the page execution environment running the injected code
        const pageContext = {
            window: {},
        }
        vm.runInNewContext(injectedCode, pageContext);

        assert.strictEqual(pageContext.window.x, 123);
    });
});
