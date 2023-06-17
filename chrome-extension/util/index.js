import {spliceString} from "./splice-string.js";
import {fetchScript} from "./fetch-script.js";
import {embedScript, injector} from "./embed-script.js";
import {zip} from "./zip.js";
import {sequential} from "./sequential.js";
import {ping} from "./ping.js";
import {base64ToTypedArray} from "./base-64-to-typed-array.js";
import {typedArrayToBase64} from "./typed-array-to-base-64.js";

/*
 * Functions are exported like this instead of directly exposed so that they can be unit-tested.
 * See https://javascript.plainenglish.io/unit-testing-challenges-with-modular-javascript-patterns-22cc22397362
 */
export const util = {
    base64ToTypedArray,
    embedScript,
    fetchScript,
    injector,
    ping,
    sequential,
    spliceString,
    typedArrayToBase64,
    zip,
};
