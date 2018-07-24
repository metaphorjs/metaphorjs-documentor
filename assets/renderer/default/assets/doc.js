

$(function(){

    $(".item-inheritance-toggler").each(function(inx, node){

        var a = $(node).children("a").first(),
            parent = $(node).parent();

        a.click(function(e){
            e.preventDefault();
            parent.find(".inherited").toggle();
            return false;
        });
    });

});