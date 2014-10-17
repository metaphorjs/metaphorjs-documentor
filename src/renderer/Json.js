
var Renderer = require("../Renderer.js"),
    globalCache = require("../var/globalCache.js");

module.exports = globalCache.add("renderer.json", Renderer.$extend({

    render: function() {
        return JSON.stringify(this.doc.getData(), null, 2);
    }

}, {
    mime: "application/json"
}));


