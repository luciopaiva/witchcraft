
// exported solely for testing
export function injector(document) {
    const fnStr = (function fn() { /*INJECTION_POINT*/ }).toString();
    const script = document.createElement("script");
    script.text = `(${fnStr})()`;
    // when injecting at document_start, experimentation shows that <head> doesn't exist and <body> may not exist either
    // this is why here we are injecting the script tag directly into <html>, which seems guaranteed to exist
    document.documentElement.appendChild(script);
}

const [INJECTOR_PREFIX, INJECTOR_SUFFIX] = injector.toString().split("/*INJECTION_POINT*/");

export function embedScript(contents) {
    return `(${INJECTOR_PREFIX}${contents}${INJECTOR_SUFFIX})(document)`;
}
