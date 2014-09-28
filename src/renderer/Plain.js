
var Renderer = require("../Renderer.js"),
    ns = require("../var/ns.js");


module.exports = ns.add("renderer.plain", Renderer.$extend({

    render: function() {

        var data = this.doc.getData(),
            html = "<ul>",
            keys = ["param", "var", "function", "namespace", "class", "property", "method"];

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
                    html += ' : '+ (item.flags.returns.join(" | "));
                }
            }

            html += '</p>';

            if (item.flags.description) {
                html += item.flags.description;
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

            html += '</li>';

        };

        renderItem(null, data);

        html += '</ul>';

        return html;
    }

}, {
    mime: "text/html"
}));

