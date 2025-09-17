
import {FETCH_RESPONSE_OUTCOME, fetchScript} from "./fetch-script.js";
import {embedScript, injector} from "./embed-script.js";
import {storage} from "../storage/index.js";
import {browser} from "../browser.js";

function base64ToTypedArray(base64Data, TypedArrayType) {
    const decodedString = atob(base64Data);
    const byteValues = Array.from(decodedString).map((char) => char.charCodeAt(0));
    return new TypedArrayType(byteValues);
}

async function ping() {
    const serverAddress = await storage.retrieveServerAddress();
    const response = await util.fetchScript(serverAddress);
    return !response || (response.outcome !== FETCH_RESPONSE_OUTCOME.FETCH_FAILURE);
}

async function sequential(tasks) {
    for (const task of tasks) {
        if (typeof task === "function") {
            await task();
        } else if (task instanceof Promise) {
            await task;
        }
    }
}

async function until(conditionFunction, timeout = 2000) {
    const start = performance.now();
    while (performance.now() - start < timeout) {
        if (conditionFunction()) {
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    return false;
}

/**
 * Splices a string. See https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
 * for more info.
 *
 * @param {String} str - string that is going to be spliced
 * @param {Number} startIndex - where to start the cut
 * @param {Number} endIndex - where to end the cut
 * @param {String} whatToReplaceWith - the substring that will replace the removed one
 * @return {String} the resulting string
 */
function spliceString(str, startIndex, endIndex, whatToReplaceWith) {
    return str.substring(0, startIndex) + whatToReplaceWith + str.substring(endIndex);
}

function typedArrayToBase64(data) {
    return btoa(String.fromCharCode.apply(null, data));
}

async function loadJson(jsonFileName, fetchFn = fetch) {
    try {
        const response = await fetchFn(browser.getFileUrl(jsonFileName));
        if (response.ok) {
            return await response.json();
        }
    } catch (_) {
    }
    return undefined;
}

function zip(...arrays) {
    const length = Math.min(...arrays.map(array => array.length));
    const result = [];
    for (let i = 0; i < length; i++) {
        result.push(arrays.map(array => array[i]))
    }
    return result;
}

/*
 * Functions are exported like this instead of directly exposed so that they can be unit-tested.
 * See https://javascript.plainenglish.io/unit-testing-challenges-with-modular-javascript-patterns-22cc22397362
 */
export const util = {
    base64ToTypedArray,
    embedScript,
    fetchScript,
    injector,
    loadJson,
    ping,
    sequential,
    spliceString,
    typedArrayToBase64,
    zip,
    until,
};
