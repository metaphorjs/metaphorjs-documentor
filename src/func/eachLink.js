
var rUrl = require("metaphorjs-shared/src/var/regexp/url.js");

module.exports = function(str, cmtItem, cb, context) {

    return str.replace(/\[#(link|tutorial|code|page)\s+([^\]]+)\]/ig,

        function(match, type, content){

            if (match.substr(match.length - 2) == '\\') {
                return match;
            }

            var name, url, item, fullName;


            if ((item = cmtItem.doc.getItem(content)) ||
                (item = cmtItem.findItem(content, null, true).shift()) ||
                (cmtItem.parent && (item = cmtItem.parent.findItem(content, null, true).shift()))) {

                if (item.file.hidden) {
                    return content;
                }

                name = item.name;
                url = '#' + item.fullName;
                fullName = item.fullName;
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

            return cb.call(context, type, name, url, fullName, match);
    });

};