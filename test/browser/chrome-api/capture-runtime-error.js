import assert from "node:assert";
import {describe, it} from "mocha";
import sinon from "sinon";
import {browser} from "../../../chrome-extension/browser/index.js";

describe("Chrome API - Capture runtime error", function () {

    beforeEach(function () {
        sinon.restore();
    });

    it("no errors", function () {
        const chrome = {
            runtime: {}
        };
        sinon.replace(browser, "chrome", () => chrome);

        const logger = {
            error: sinon.stub(),
        };

        assert.strictEqual(browser.captureRuntimeError(logger), false);
        assert(logger.error.notCalled);
    });

    it("unknown error", function () {
        const chrome = {
            runtime: {
                lastError: {
                    message: "Some unexpected error happened.",
                }
            }
        };
        sinon.replace(browser, "chrome", () => chrome);

        const logger = {
            error: sinon.stub(),
        };

        assert.strictEqual(browser.captureRuntimeError(logger), true);
        assert(logger.error.calledOnce);
    });

    [
        {
            name: "no tab with id",
            message: "No tab with id: 1064422151.",
        },
        {
            name: "no frame with id",
            message: "No frame with id 3216546 in tab 1064422151.",
        },
    ].forEach(({ name, message }) => {
        it(`ignored error: ${name}`, function () {
            const chrome = {
                runtime: {
                    lastError: {
                        message,
                    },
                }
            };
            sinon.replace(browser, "chrome", () => chrome);

            const logger = {
                error: sinon.stub(),
            };

            assert.strictEqual(browser.captureRuntimeError(logger), true);
            assert(logger.error.notCalled);
        });
    })
});
