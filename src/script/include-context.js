
export default class IncludeContext {
    /** @type {ScriptContext} */
    script;
    startIndex = -1;
    endIndex = -1;

    constructor(script, startIndex, endIndex) {
        this.script = script;
        this.startIndex = startIndex;
        this.endIndex = endIndex;
    }
}
