
export function base64ToTypedArray(base64Data, TypedArrayType) {
    const decodedString = atob(base64Data);
    const byteValues = Array.from(decodedString).map((char) => char.charCodeAt(0));
    return new TypedArrayType(byteValues);
}
