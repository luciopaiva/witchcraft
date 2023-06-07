
function injector() {
    const fnStr = (function fn() { /*INJECTION_POINT*/ }).toString();
    const script = document.createElement("script");
    script.text = `(${fnStr})()`;
    // when injecting at document_start, experimentation shows that <head> doesn't exist and <body> may not exist either
    // this is why here we are injecting the script tag directly into <html>, which seems guaranteed to exist
    document.documentElement.appendChild(script);
}

export function embedScript(contents) {
    const wrapped = injector.toString().replace("/*INJECTION_POINT*/", contents);
    return `(${wrapped})()`;
}
