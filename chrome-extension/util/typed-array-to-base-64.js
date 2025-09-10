
export function typedArrayToBase64(data) {
    return btoa(String.fromCharCode.apply(null, data));
}
