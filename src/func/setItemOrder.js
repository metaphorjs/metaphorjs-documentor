
var Item = require("../Item.js");

module.exports = function(items, orderCfg) {

    var res = [];

    var all = false;

    orderCfg.forEach(function(entry){
        
        if (entry === '*') {
            all = true;
            return;
        }
        
        var not = entry[0] === "!";
        if (not) {
            entry = entry.substr(1);
        }

        items.forEach(function(item){

            var is = item.isThe(entry);

            if (!is && all) {
                res.push(item);
            }

            if (is && not) {
                return;
            }

            if (is) {
                res.push(item);
                if (all) {
                    res = false;
                }
            }
        });
    });

    return res;
};