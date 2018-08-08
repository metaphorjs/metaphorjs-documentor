
var Renderer = require("../Renderer.js"),
    Promise = require("metaphorjs-promise/src/lib/Promise.js"),
    globalCache = require("../var/globalCache.js");

module.exports = globalCache.add("renderer.json", Renderer.$extend({

    render: function() {
        this.writeOut(
            JSON.stringify(this.doc.exportData(), null, 2)
        );

        return Promise.resolve();
    }

}));


