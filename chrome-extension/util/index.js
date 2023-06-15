import {spliceString} from "./splice-string.js";
import {fetchScript} from "./fetch-script.js";
import {embedScript, injector} from "./embed-script.js";
import {zip} from "./zip.js";
import {sequential} from "./sequential.js";

/*
 * Functions are exported like this instead of directly exposed so that they can be unit-tested.
 * See https://javascript.plainenglish.io/unit-testing-challenges-with-modular-javascript-patterns-22cc22397362
 */
export const util = {
    embedScript,
    fetchScript,
    injector,
    sequential,
    spliceString,
    zip,
};
