
module.exports = function(flag, content, comment, item) {

    var file = comment ? comment.file : (item ? item.file : null);

    if (!file) {
        return {};
    }

    var getCurly = file.pget("comment.getCurly"),
        normalizeType = file.pget("normalizeType"),
        type, name,
        description,
        inx;

    if (content && typeof content === "string") {

        if (content.charAt(0) == '{') {
            
            var curly = getCurly.call(this, content);
            type = normalizeType.call(this, curly, file);
            content = content.replace('{' + curly + '}', "").trim();
        }

        inx = content.indexOf(" ", 0);

        if (inx > -1) {
            name = content.substr(0, inx).trim();
            content = content.substr(inx).trim();

            if (content) {
                description = content;
            }
        }
        else if (content) {
            if (!type) {
                type = content;
            }
            else {
                name = content;
            }
        }
    }


    return {
        name: name,
        type: type,
        description: description
    };
};