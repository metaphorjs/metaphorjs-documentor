
var globalCache = require("../../var/globalCache.js");

/**
 * @group hook
 * @function
 * Sort items by exact order. Called from various places where configured sorters
 * are applied.
 * @param {array} items
 * @param {object} cfg {
 *  @type {array} order {
 *      List of instructions: '*' - all, 'some:name' - item name, '!some:name' - not.
 *  }
 * }
 * @param {Documentor} doc
 * @returns {array}
 */
module.exports = globalCache.add("sort.exact", function(items, cfg, doc) {

    var res = [],
        append = [],
        all = false,
        origItems = items.slice();

    cfg.order.forEach(function(entry){
        
        if (entry === '*') {
            all = true;
            return;
        }
        
        var not = entry[0] === "!";
        if (not) {
            entry = entry.substr(1);
        }

        var leftovers = [],
            item,
            is;
        
        while (item = origItems.shift()) {

            is = typeof item === "string" ? 
                    item == entry : item.isThe(entry);

            if (!is && all) {
                res.push(item);
                continue;
            }

            if (is && not) {
                continue;
            }

            if (is) {
                if (all) {
                    append.push(item);
                }
                else {
                    res.push(item);
                }
                continue;
            }

            leftovers.push(item);
        }

        origItems = leftovers.slice();
    });

    return res.concat(append);
});