

module.exports = function(line) {

    var i, l,
        char,
        left = 0,
        right = 0;

    for (i = 0, l = line.length; i < l; i++) {
        char = line.charAt(i);
        if (char == '{') {
            left++;
        }
        else if (char == '}') {
            right++;
        }
    }

    return [left, right];
};