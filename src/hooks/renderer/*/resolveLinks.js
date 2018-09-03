
var globalCache = require("../../../var/globalCache.js"),
    eachLink = require("../../../func/eachLink.js")

/**
 * @group hook
 * @function
 * Transform flags that contain type refs into markdown links
 * @param {Renderer} renderer
 */
module.exports = globalCache.add("renderer.*.resolveLinks", 
    function(r){
        r.doc.eachItem(function(item) {
            item.eachFlag(function(name, flag){
                if (flag.type == "typeRef") {
                    //return '['+ flag.content +'](#'+ flag.ref +')';
                }
                if (typeof flag.content == "string") {
                    flag.content = eachLink(flag.content, item, 
                        function(type, name, url, fullName) {
                        return '['+ (fullName || name || url) +']('+ (url || name) +')';
                    });
                }
            });
        });
    });