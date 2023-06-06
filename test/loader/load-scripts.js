
import { describe, it, setup, teardown } from "mocha";
import sinon from "sinon";
import {loader} from "../../chrome-extension/loader/index.js";
import {util} from "../../chrome-extension/util/index.js";
import {FETCH_RESPONSE_OUTCOME} from "../../chrome-extension/util/fetch-script.js";
import {SERVER_URL} from "../../chrome-extension/script/prepend-server-origin.js";

describe("Load scripts", function () {

    teardown(function () {
        sinon.restore();
    });

    it("load simple scripts", async function () {
        const url = "https://google.com";
        const tabId = 123;
        const frameId = 456;

        const fetchScript = sinon.stub(util, "fetchScript");
        fetchScript
            .withArgs(`${SERVER_URL}/_global.js`)
            .returns({
                outcome: FETCH_RESPONSE_OUTCOME.SUCCESS,
                contents: `console.info("global");`,
            })
            .withArgs(`${SERVER_URL}/google.com.js`)
            .returns({
                outcome: FETCH_RESPONSE_OUTCOME.SUCCESS,
                contents: `console.info("google.com");`,
            });
        // all other script attempts will return 404
        fetchScript.returns({
            outcome: FETCH_RESPONSE_OUTCOME.NOT_FOUND,
            contents: undefined,
        });

        const sendScript = sinon.spy(loader, "sendScript");

        await loader.loadScripts(url, tabId, frameId);

        sinon.assert.calledTwice(sendScript);
        sinon.assert.calledWith(sendScript, sinon.match({
            path: '_global.js',
            type: 'js',
            url: 'http://localhost:5743/_global.js'
        }), tabId, frameId);
        sinon.assert.calledWith(sendScript, sinon.match({
            path: 'google.com.js',
            type: 'js',
            url: 'http://localhost:5743/google.com.js'
        }), tabId, frameId);
    });
});
