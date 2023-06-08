
import assert from "assert";
import { describe, it } from "mocha";
import {util} from "../../chrome-extension/util/index.js";
import {FETCH_RESPONSE_OUTCOME} from "../../chrome-extension/util/fetch-script.js";
import sinon from "sinon";

describe("Fetch script", function () {

    beforeEach(function () {
        sinon.restore();
    });

    it("success", async function () {
        const result = await util.fetchScript("", fakeFetch(200, "foo"));
        assert.strictEqual(result.outcome, FETCH_RESPONSE_OUTCOME.SUCCESS);
        assert.strictEqual(result.contents, "foo");
    });

    it("not found", async function () {
        const result = await util.fetchScript("", fakeFetch(404));
        assert.strictEqual(result.outcome, FETCH_RESPONSE_OUTCOME.NOT_FOUND);
        assert.strictEqual(result.contents, undefined);
    });

    it("server error", async function () {
        const result = await util.fetchScript("", fakeFetch(500));
        assert.strictEqual(result.outcome, FETCH_RESPONSE_OUTCOME.SERVER_FAILURE);
        assert.strictEqual(result.contents, undefined);
    });

    it("fetch error", async function () {
        const result = await util.fetchScript("", () => { throw new Error(); });
        assert.strictEqual(result.outcome, FETCH_RESPONSE_OUTCOME.FETCH_FAILURE);
        assert.strictEqual(result.contents, undefined);
    });
});

function fakeFetch(status, text) {
    return async () => {
        return {
            status: status,
            text: () => text,
        };
    }
}
