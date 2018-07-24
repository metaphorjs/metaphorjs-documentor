

$(function(){

    $(".item-inheritance-toggler").each(function(inx, node){
        console.log(node);
        console.log($(node).children())
        var a = $(node).children("a").first(),
            parent = $(node).parent();

        console.log(a.get(), parent.get())
        
        a.click(function(e){
            e.preventDefault();
            parent.find(".inherited").toggle();
            return false;
        });
    });

});