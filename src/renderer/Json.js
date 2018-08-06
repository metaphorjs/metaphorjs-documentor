
var Renderer = require("../Renderer.js"),
    globalCache = require("../var/globalCache.js");

module.exports = globalCache.add("renderer.json", Renderer.$extend({

    render: function() {
        return self.writeOut(
            JSON.stringify(this.doc.exportData(), null, 2)
        );
    }

}));


