
export function zip(...arrays) {
    const length = Math.min(...arrays.map(array => array.length));
    const result = [];
    for (let i = 0; i < length; i++) {
        result.push(arrays.map(array => array[i]))
    }
    return result;
}
