var globalCache = require("../../../../../var/globalCache.js");

/**
 * @group hook
 * @function
 * Calls <code>item.*.sortChildTypes</code> and <code>item.*.sort</code> 
 * hooks for all item children and all their children.
 * @param {Item} item
 * @param {object} cfg Documentor config
 */
module.exports = globalCache.add("file.*.item.*.sortChildren", 
    function(item, cfg) {

        var fn;

        fn = item.pget("sortChildTypes");
        item.items = fn.call(null, item.items, cfg);

        for (childType in item.items) {
            fn = item.items[childType][0].pget("sort");
            item.items[childType] = fn.call(
                null, item.items[childType], cfg, 
                item, childType
            );
        }
    });

