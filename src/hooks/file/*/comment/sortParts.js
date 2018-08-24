

var globalCache = require("../../../../var/globalCache.js");

/**
 * @group hook
 * @function
 * Sort comment parts by context so that flags that require parent context were 
 * farther in the list than flags defining this context. (param flags after function flag)
 * @param {array} parts Comment parts from parseComment()
 * @param {Comment} comment
 * @returns {array}
 */
module.exports = globalCache.add("file.*.comment.sortParts", function(parts, comment) {

    var flagInx = {},
        items = comment.file.pget("items");

    if (!items) {
        return parts;
    }

    var reqCtx = comment.file.pget("item.?.requiredContext") || {};

    items.forEach(function(item, inx) {
        flagInx[item.name] = inx;
    });

    // flags sorted by a simple rule:
    // if flag has an item associated with it (class, method, var, etc) it goes higher
    // if flag does not have an item, but requires an item, it goes below items
    // the rest goes to the bottom
    parts.sort(function(a, b){

        // flag can be "constructor"
        // so we must check hasOwnProperty
        var aInx    = flagInx.hasOwnProperty(a.flag) ? flagInx[a.flag] : undefined,
            bInx    = flagInx.hasOwnProperty(b.flag) ? flagInx[b.flag] : undefined,
            aUndf   = typeof aInx == "undefined",
            bUndf   = typeof bInx == "undefined",
            aCtx    = reqCtx.hasOwnProperty(a.flag),
            bCtx    = reqCtx.hasOwnProperty(b.flag),
            aEnd    = a.flag.indexOf("end-") === 0,
            bEnd    = a.flag.indexOf("end-") === 0;

        if (aInx === bInx) {

            // if both are simple flags
            // we need to check if any of them
            // requires a context;
            // we put context aware flags above
            if (aUndf) {
                // we put all end-* flags to the bottom
                if ((aEnd || bEnd) && aEnd != bEnd) {
                    return aEnd ? 1 : -1;
                }
                if (aCtx === bCtx) {
                    return a.inx < b.inx ? -1 : 1;
                    //return 0;
                }
                return aCtx ? -1 : 1;
            }

            return a.inx < b.inx ? -1 : 1;
            //return 0;
        }
        else if (aUndf != bUndf) {
            return aUndf ? 1 : -1;
        }
        else {
            return aInx < bInx ? -1 : 1;
        }
    });

    return parts;
});