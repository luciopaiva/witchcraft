
export default class ScriptContext {
    /** @type {string} */
    path;
    /** @type {string} */
    type;
    /** @type {string} */
    url;
    /** @type {string} */
    #contents;
    #hasContents = false;

    constructor(path, type) {
        this.path = path;
        this.type = type;
    }

    get contents() {
        return this.#contents;
    }

    set contents(contents) {
        this.#contents = contents;
        this.#hasContents = typeof contents === "string";
    }

    get hasContents() {
        return this.#hasContents;
    }
}
