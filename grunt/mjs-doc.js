
module.exports = function(grunt) {

    if (process.env['METAPHORJS_DEV']) {
        require("../../metaphorjs/dev/env.js");
    }

    grunt.registerMultiTask("mjs-doc", function(){

        var done = this.async();

        try {

            var opt     = this.options(),
                Documentor = require("../dist/metaphorjs.documentor.npm.js");

            Documentor.Runner.run(opt, null, null, function(e){
                grunt.warn(e);
            }, done);
        }
        catch (thrownErr) {
            grunt.warn(thrownErr);
        }
    });

};