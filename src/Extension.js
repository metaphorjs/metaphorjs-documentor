
var Base = require("./Base.js");

module.exports = Base.$extend({


    resolveIncludes: function(file) {
        return [];
    },

    getTypeAndName: function(file, start, context) {
        return null;
    },

    normalizeType: function(type) {
        return type;
    }


});