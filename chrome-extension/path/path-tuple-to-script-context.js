import ScriptContext from "../script/script-context.js";

export function pathTupleToScriptContext([path, ext]) {
    return new ScriptContext(appendExtension(path, ext), ext);
}

function appendExtension(path, ext) {
    return `${path}.${ext}`;
}
