
var globalCache = require("../../../../var/globalCache.js");

module.exports = globalCache.add("file.*.comment.getCurly", 
    function(content, start, backwards, returnIndexes, brakets) {

    var left, right,
        i, l,
        first, last,
        char,
        openChar = brakets ? brakets[0] : '{',
        closeChar = brakets ? brakets[1] : '}';

    if (!backwards) {

        left    = 0;
        right   = 0;
        i       = start || 0;
        l       = content.length;
        first   = null;

        for (; i < l; i++) {

            char = content.charAt(i);

            if (char === openChar) {
                left++;
                if (first === null) {
                    first = i + 1;
                }
            }
            else if (char === closeChar && first !== null) {
                right++;
            }

            if (left > 0 && left == right) {
                last = i;
                break;
            }
        }
    }
    else {

        left    = 0;
        right   = 0;
        i       = start || content.length - 1;
        last    = null;

        for (; i >= 0; i--) {

            char = content.charAt(i);

            if (char === closeChar) {
                right++;
                if (last === null) {
                    last = i;
                }
            }
            else if (char === openChar && last !== null) {
                left++;
            }

            if (left > 0 && left == right) {
                first = i + 1;
                break;
            }
        }
    }

    if (first && last) {
        if (returnIndexes) {
            return [first, last];
        }
        else {
            return content.substring(first, last);
        }
    }

    return null;
});