
var Renderer = require("../Renderer.js"),
    globalCache = require("../var/globalCache.js");


module.exports = globalCache.add("renderer.plain", Renderer.$extend({

    render: function() {

        var data = this.doc.getData(),
            html = "<ul>",
            keys = ["param", "var", "function", "namespace", "class", "property", "method"],
            key, value;

        var renderItem = function(type, item) {

            html += '<li>';
            html += '<p>';

            if (type) {
                html += '<i>' + type + '</i> ';
            }

            if (item.name) {
                if (item.flags.type) {
                    html += '['+ (item.flags.type.join(" | ")) +'] ';
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
                    if (typeof item.flags.returns == "string") {
                        html += ' : !!![' + (item.flags.returns) + ']';
                    }
                    else {
                        html += ' : [' + (item.flags.returns.join(" | ")) + ']';
                    }
                    delete item.flags.returns;
                }
            }

            html += '</p>';

            if (item.flags.description) {
                html += '<p>';
                html += item.flags.description;
                html += '</p>';
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
                flags += '<li>'+key+' : '+value+'</li>';
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

