
var Renderer = require("../Renderer.js"),
    globalCache = require("../var/globalCache.js");


module.exports = globalCache.add("renderer.plain", Renderer.$extend({

    render: function() {

        var data = this.doc.getData(),
            html = "<ul>",
            keys = ["param", "var", "function", "namespace", "class", "property", "method"],
            key, value;

        var renderFlags = function(flagName, flags, wrap, splitter) {

            var html = "";

            flags.forEach(function(f, i){

                if (i > 0 && splitter) {
                    html += splitter;
                }

                if (wrap) {
                    html += '<' + wrap + '>';
                }

                if (f.contentType == "code") {
                    html += '<pre><code>';
                }

                html += f.content;

                if (f.contentType == "code") {
                    html += '</code></pre>';
                }

                if (wrap) {
                    html += '</' + wrap + '>';
                }

            });

            return html;
        };

        var renderItem = function(type, item) {

            html += '<li>';
            html += '<p>';

            if (type) {
                html += '<i>' + type + '</i> ';
            }

            if (item.name) {
                if (item.flags.type) {
                    html += '['+ (renderFlags(null, item.flags.type, null, ' | ')) +'] ';
                    delete item.flags.type;
                }
                html += '<b>' + item.name + '</b>';

                if (item.param) {
                    html += '(';

                    var params = [];
                    item.param.forEach(function(param){
                        params.push(param.name);
                    });
                    html += params.join(", ");
                    html += ')';
                }

                if (item.flags.returns) {
                    html += ' : [' + (renderFlags(null, item.flags.returns, null, ' | ')) + ']';
                    delete item.flags.returns;
                }
            }

            html += '</p>';

            if (item.file && item.line) {
                html += '<p><sub>';
                html += item.file + " : " + item.line;
                html += '</sub></p>';
            }

            if (item.flags.description) {
                html += renderFlags(null, item.flags.description, 'p');
                delete item.flags.description;
            }

            keys.forEach(function(key){

                var items = item[key];

                if (items) {
                    html += '<ul>';
                    items.forEach(function(item){
                        renderItem(key, item);
                    });
                    html += '</ul>';
                }
            });

            var flags = "";
            for (key in item.flags) {
                value = item.flags[key];
                value.forEach(function(f){
                    flags += '<li><p>'+key+' : '+ f.content +'</p></li>';
                });

            }
            if (flags) {
                html += '<ul>' + flags + '</ul>';
            }

            html += '</li>';

        };

        renderItem(null, data);

        html += '</ul>';

        return html;
    }

}, {
    mime: "text/html"
}));

