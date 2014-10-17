
module.exports = function(name) {

    var list = [],
        path = name.split("."),
        tmp,
        i,
        max = Math.floor(path.length / 2),
        last = path.length - 2,
        j, z;

    list.push(name);

    for (j = 1; j <= max; j++) {

        for (i = last; i >= 0 && i >= (j - 1) * 2; i-=2) {
            tmp = path.slice();
            for (z = 0; z < j; z++) {
                tmp[i - (z * 2)] = "*";
            }
            list.push(tmp.join("."));
        }
    }

    return list.filter(function(value, index, self){
        return self.indexOf(value) === index;
    });
};