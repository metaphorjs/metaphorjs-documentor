

var undf = require("metaphorjs-shared/src/var/undf.js"),
    generateTemplateNames = require("./generateTemplateNames.js");

module.exports = function(Template){

    var cache = Template.cache,
        origGet = cache.get;

    cache.get = function(id){

        var names = generateTemplateNames(id),
            i, l,
            tpl;

        for (i = 0, l = names.length; i < l; i++) {

            if ((tpl = origGet(names[i])) !== undf) {
                return tpl;
            }
        }

        return undf;
    };

};