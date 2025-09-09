import { describe, it } from "mocha";
import sinon from "sinon";
import {loader} from "../../chrome-extension/loader/index.js";
import {util} from "../../chrome-extension/util/index.js";
import {FETCH_RESPONSE_OUTCOME} from "../../chrome-extension/util/fetch-script.js";
import {DEFAULT_SERVER_ADDRESS} from "../../chrome-extension/constants.js";
import {browser} from "../../chrome-extension/browser/index.js";

describe("Load scripts", function () {

    beforeEach(function () {
        sinon.restore();
    });

    it("load simple scripts", async function () {
        const url = "https://google.com";
        const tabId = 123;
        const frameId = 456;

        sinon.replace(browser.api, "retrieveKey", async (key) => {
            switch (key) {
                case "server-address":
                    return DEFAULT_SERVER_ADDRESS;
                default:
                    return null;
            }
        });
        sinon.replace(browser.api, "removeKey", async () => {});
        sinon.replace(browser.api, "storeKey", async () => {});
        sinon.replace(browser.api, "setBadgeText", async () => {});

        const fetchScript = sinon.stub(util, "fetchScript");
        fetchScript
            .withArgs(`${DEFAULT_SERVER_ADDRESS}/_global.js`)
            .returns({
                outcome: FETCH_RESPONSE_OUTCOME.SUCCESS,
                contents: `console.info("global");`,
            })
            .withArgs(`${DEFAULT_SERVER_ADDRESS}/google.com.js`)
            .returns({
                outcome: FETCH_RESPONSE_OUTCOME.SUCCESS,
                contents: `console.info("google.com");`,
            });
        // all other script attempts will return 404
        fetchScript.returns({
            outcome: FETCH_RESPONSE_OUTCOME.NOT_FOUND,
            contents: undefined,
        });

        const sendScript = sinon.stub(loader, "injectScript");

        await loader.loadScripts(url, tabId, frameId);

        sinon.assert.calledTwice(sendScript);
        sinon.assert.calledWith(sendScript, sinon.match({
            path: '_global.js',
            type: 'js',
            url: `${DEFAULT_SERVER_ADDRESS}/_global.js`
        }), tabId, frameId);
        sinon.assert.calledWith(sendScript, sinon.match({
            path: 'google.com.js',
            type: 'js',
            url: `${DEFAULT_SERVER_ADDRESS}/google.com.js`
        }), tabId, frameId);
    });
});
