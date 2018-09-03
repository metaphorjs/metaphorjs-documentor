
module.exports = function(name){

    var list        = [],
        path        = name.split("."),
        //max         = path.length - 3,
        //last        = path.length - 1,
        exts        = [path[0], '*'],
        tmp, i, j, ext, e;

    for (e = 0; e < 2; e++) {

        ext = exts[e];
        tmp = path.slice();
        tmp[0] = ext;
        list.push(tmp.join("."));
        tmp[2] = "*";
        list.push(tmp.join("."));

        /*for (j = 1; j <= max; j++) {
            for (i = last; i > last - j; i--) {
                tmp[i] = "*";
                list.push(tmp.join("."));
            }
        }*/
    }

    return list.filter(function(value, index, self){
        return self.indexOf(value) === index;
    });
};