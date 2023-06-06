
/**
 * Splices a string. See https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
 * for more info.
 *
 * @param {String} str - string that is going to be spliced
 * @param {Number} startIndex - where to start the cut
 * @param {Number} endIndex - where to end the cut
 * @param {String} whatToReplaceWith - the substring that will replace the removed one
 * @return {String} the resulting string
 */
export function spliceString(str, startIndex, endIndex, whatToReplaceWith) {
    return str.substring(0, startIndex) + whatToReplaceWith + str.substring(endIndex);
}
