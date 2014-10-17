
module.exports = function hideLinks(comment) {

    comment = comment.replace(/{\s*@(link|tutorial).+}/ig, function(match){
        if (match.substr(match.length - 2) == '\\') {
            return match;
        }
        return '[#' + match.substring(2, match.length - 1) + ']';
    });

    return comment;

};