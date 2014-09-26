
var Base = require("./Base.js"),
    trim = require("../../metaphorjs/src/func/trim.js"),
    calcCurlies = require("./func/calcCurlies.js"),
    undf = require("../../metaphorjs/src/var/undf.js");


/**
 * @class Comment
 */
module.exports = Base.$extend({

    comment: null,
    doc: null,
    file: null,
    startIndex: null,
    endIndex: null,
    parts: null,

    /**
     * @param {object} cfg {
     *      @type {string} a
     *      @type {string} b
     * }
     */
    $init: function() {
        this.parts = [];
        this.$super();
    },

    parse: function() {

        this.removeAsterisk();
        this.parts = this.splitParts(this.comment);
        this.sortParts();
    },

    hasFlag: function(flag) {

        var parts = this.parts,
            i, l;

        for (i = 0, l = parts.length; i < l; i++) {
            if (parts[i].type == flag) {
                return true;
            }
        }

        return false;
    },

    determineType: function(currentContext) {

        var parts   = this.parts,
            doc     = this.doc,
            part,
            i, l;

        for (i = 0, l = parts.length; i < l; i++) {
            part = parts[i];
            if (doc.getItemType(part.type)) {
                return;
            }
        }

        var ext     = doc.getExtension(this.file),
            itemType;

        if (this.hasFlag("return") || this.hasFlag("returns")) {
            itemType = "function";
        }

        if (ext && (part = ext.getTypeAndName(this.file, this.endIndex, currentContext, itemType))) {
            parts.unshift(part);
            return;
        }

        this.parts = [];
    },

    sortParts: function() {

        var parts = this.parts,
            types = this.doc.getItemTypes(),
            compare = function(a, b) {
                var atype = types[a.type],
                    btype = types[b.type],
                    apri, bpri;

                if (!atype && !btype) {
                    return 0;
                }
                else if (atype && !btype) {
                    return -1;
                }
                else if (!atype && btype) {
                    return 1;
                }

                apri = atype.priority;
                bpri = btype.priority;

                if (apri == bpri) {
                    return 0;
                }
                else if (apri === undf || apri > bpri) {
                    return 1;
                }
                else if (bpri === undf || apri < bpri) {
                    return -1;
                }
            };

        parts.sort(compare);
    },

    splitDeepParts: function(text) {

        var lines   = text.split("\n"),
            fline   = lines.shift(),
            lline   = lines.pop(),
            parts   = this.splitParts(lines.join("\n")),
            i       = fline.length;

        while (i > 0) {
            if (fline.charAt(i) == '{') {
                fline = trim(fline.substring(0, i - 1));
                parts.unshift({type: "description", content: fline});
                break;
            }
            i--;
        }

        return parts;
    },

    splitParts: function(text) {

        var lines = text.split("\n"),
            parts = [],
            line,
            left, right,
            crls,
            flag,
            deep = false,
            part = "",
            i, l;



        for (i = 0, l = lines.length; i < l; i++) {

            line = lines[i];

            if (trim(line).charAt(0) == '@') {

                if (part) {
                    parts.push({type: flag || "description", content: part});
                    part = "";
                    flag = null;
                }

                flag    = line.match(/@[^\s]+/)[0].substr(1);
                line    = trim(line.substr(line.indexOf('@' + flag) + flag.length + 1));
                crls    = calcCurlies(line);
                left    = crls[0];
                right   = crls[1];
                part    = line;
                deep    = false;

                while (left != right) {
                    line    = lines[++i];
                    crls    = calcCurlies(line);
                    left   += crls[0];
                    right  += crls[1];
                    part   += "\n" + line;
                    deep    = true;
                }

                if (deep) {
                    part = this.splitDeepParts(part);
                    parts.push({type: flag, content: part});
                    part = "";
                    flag = null;
                }
            }
            else {
                part += line;
            }
        }

        if (part || flag) {
            parts.push({type: flag || "description", content: part});
        }

        return parts;
    },

    removeAsterisk: function() {

        var text    = this.comment,
            lines   = text.split("\n"),
            min     = 1000,
            line,
            i, l,
            j, jl;

        for (i = 0, l = lines.length; i < l; i++) {
            line = trim(lines[i]);
            line = line.substr(1);
            lines[i] = line;

            for (j = 0, jl = line.length; j < jl; j++) {
                if (line.charAt(j) != " ") {
                    min = Math.min(min, j);
                    break;
                }
            }
        }

        for (i = 0, l = lines.length; i < l; i++) {
            lines[i] = lines[i].substr(min);
        }

        this.comment = trim(lines.join("\n"));
    }

});