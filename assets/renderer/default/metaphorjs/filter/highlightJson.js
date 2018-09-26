var MetaphorJs = require("metaphorjs/src/MetaphorJs.js");

MetaphorJs.filter.highlightJson = function(input, scope, prop) {
    
    var hl = Prism.highlight(input, Prism.languages.javascript),
        r = /\/\*fold-start ([^*]+)\*\//,
        startSpan, endSpan, startReg, endReg,
        start, end, key,
        match;

    while ((match = hl.match(r)) !== null) {
        key = match[1];
        startSpan = '<span class="token comment">/*fold-start '+key+'*/</span>';
        endSpan = '<span class="token comment">/*fold-end '+key+'*/</span>';
        startReg = new RegExp('<span class="token comment">/\\*fold-start '+key+'\\*/</span>[\\r\\n]');
        endReg = new RegExp('([\\r\\n\\s]*)</div><span class="token comment">/\\*fold-end '+key+'\\*/</span>');
        start = hl.indexOf(startSpan);
        end = hl.indexOf(endSpan);

        hl = hl.substring(0, start + startSpan.length + 1) + 
            '<div {show}="this.show_'+key+'">' +
            hl.substring(start + startSpan.length + 1, end) +
            '</div>' +
            hl.substr(end);

        hl = hl.replace(
            startReg, 
            '<a class="code-fold-expander" '+
                '{init}="this.show_'+key+' = false" '+
                '(click)="this.show_'+key+' = !this.show_'+key+'"' +
                '{class.collapsed}="!this.show_'+key+'"' +
                '{class.expanded}="this.show_'+key+'"' +
                'href="#">'+
                '<span class="cfe-expand">+</span>'+
                '<span class="cfe-collapse">-</span>'+
            '</a>'
        );

        hl = hl.replace(endReg, function(match, space){
            space = space.replace(/[\r\n]/g, '');
            return '</div><span {show}="this.show_'+key+'">'+space+'</span>';
        });
    }

    return hl;
};