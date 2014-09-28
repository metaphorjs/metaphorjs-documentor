
module.exports = function(content) {

    var left = 0,
        right = 0,
        i, l,
        first = null, last,
        char;

    for (i  = 0, l = content.length; i < l; i++) {

        char = content.charAt(i);

        if (char == '{') {
            left++;
            if (first === null) {
                first = i + 1;
            }
        }
        else if (char == '}') {
            right++;
        }

        if (left > 0 && left == right) {
            last = i;
            break;
        }
    }

    if (first && last) {
        return content.substring(first, last);
    }
};