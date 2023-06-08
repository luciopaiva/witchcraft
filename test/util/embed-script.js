import vm from "node:vm";
import assert from "node:assert";
import {describe, it} from "mocha";
import sinon from "sinon";
import {util} from "../../chrome-extension/util/index.js";

describe("Embed script", function () {

    beforeEach(function () {
        sinon.restore();
    });

    it("simple embed", function () {
        // step 1: prepare script to embed

        const contents = `
            window.x = 123;
        `;
        const code = util.embedScript(contents);

        // step 2: pass it to the content script execution environment

        const script = {
            text: "",
        }

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

    it("injector", function () {
        const script = {
            text: "",
        }

        const appendChildFn = sinon.fake();

        const document = {
            createElement: sinon.fake.returns(script),
            documentElement: {
                appendChild: appendChildFn,
            }
        };

        util.injector(document);

        assert(document.documentElement.appendChild.calledOnce);
        assert(document.documentElement.appendChild.getCall(0).firstArg === script)
        console.info(script);

        return script.text;
    });
});
