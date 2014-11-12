
var rUrl = require("../../../metaphorjs/src/var/rUrl.js");

module.exports = function(str, cmtItem, cb, context) {

    return str.replace(/\[#(link|tutorial|code|page)\s+([^\]]+)\]/ig,

        function(match, type, content){

            if (match.substr(match.length - 2) == '\\') {
                return match;
            }

            var name, url, item;

            if ((item = cmtItem.doc.getItem(content)) ||
                (item = cmtItem.findItem(content, null, true).shift())) {
                name = item.name;

                url = '#' + item.fullName;
            }
            else {
                name = content.replace(rUrl, function(urlMatch){
                    url = urlMatch;
                    return "";
                });

                if (!name && url) {
                    name = url;
                }
            }

            return cb.call(context, type, name, url, match);
    });

};