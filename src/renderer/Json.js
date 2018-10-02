require("metaphorjs-promise/src/lib/Promise.js");

var Renderer = require("../Renderer.js"),
    globalCache = require("../var/globalCache.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * @class renderer.Json
 * @extends Renderer
 * Save output in json file
 */
module.exports = globalCache.add("renderer.json", Renderer.$extend({

    render: function() {
        this.writeOut(
            JSON.stringify(this.doc.exportData(), null, 2)
        );

        return MetaphorJs.lib.Promise.resolve();
    }

}));


