
var globalCache = require("../../var/globalCache.js");

/**
 * @group hook
 * @function
 * Sort items by exact order
 * @param {array} items
 * @param {object} cfg
 * @param {Documentor} doc
 * @returns {array}
 */
module.exports = globalCache.add("sort.exact", function(items, cfg, doc) {

    var res = [],
        all = false;

    cfg.order.forEach(function(entry){
        
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
});