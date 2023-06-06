
export const SERVER_URL = "http://localhost:5743";

export function prependServerOrigin(script) {
    script.url = `${SERVER_URL}/${script.path}`;
    return script;
}
