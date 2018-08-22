
var globalCache = require("metaphorjs-documentor/src/var/globalCache.js");

module.exports = globalCache.add("file.*.item.*.setGroup", 
    function(item) {

        if (item.group == "hook") {
            for (i = 0, l = item.doc.hookDirs.length; i < l; i++) {
                hd = item.doc.hookDirs[i];

                if (item.file.path.indexOf(hd) === 0) {
                    name = item.file.path.replace(hd, "");

                    if (name.substr(0,1) === '/') {
                        name = name.substr(1);
                    }

                    name = name.replace(/\//g, '.');
                    name = name.replace(".js", '');

                    item.name = name;

                    break;
                }
            }
        }
    });