var cs = require("./var/cs.js"),
    extend = require("../../metaphorjs/src/func/extend.js");

module.exports = cs.define({

    $constructor: function(cfg) {
        extend(this, cfg, true, false);
        this.$super(cfg);
    }
});