
var globalCache = require("../../../../../../var/globalCache.js");

module.exports = globalCache.add("file.js.item.*.description.added", function(flag, item){

    var ft;

    if (ft = flag.getProperty("fileType")) {
        if (ft == "js") {
            flag.setType("code");
        }
    }

});