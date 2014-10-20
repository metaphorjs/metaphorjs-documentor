
module.exports = function(name) {

    var list        = [],
        path        = name.split("."),
        strategy    = path[0];


    if (strategy == "file") {

        var max         = path.length - 3,
            last        = path.length - 2,
            exts        = [path[1], '*'],
            tmp, i, j, z, ext, e;

        for (e = 0; e < 2; e++) {

            ext = exts[e];
            tmp = path.slice();
            tmp[1] = ext;
            list.push(tmp.join("."));

            for (j = 1; j <= max; j++) {

                for (i = last; i >= 3; i--) {
                    tmp = path.slice();
                    tmp[1] = ext;
                    for (z = 0; z < j && i - z >= 3; z++) {
                        tmp[i - z] = "*";
                    }
                    list.push(tmp.join("."));
                }
            }
        }
    }
    else {
        list.push(name);
    }

    return list.filter(function(value, index, self){
        return self.indexOf(value) === index;
    });
};