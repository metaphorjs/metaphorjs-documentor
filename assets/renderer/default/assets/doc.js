

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

    $(".code-toggler").each(function(inx, node){

        $(node).click(function(e){

            var precode = $(node).parent();

            if (precode.is(".visible")) {
                precode.removeClass("visible").addClass("hidden");
            }
            else {
                precode.removeClass("hidden").addClass("visible");
            }

            //var code = $(node).parent().find("code").first(),
            //    ph = $(node).parent().find(".code-placeholder").first();

            

            /*$(code).toggle();
            $(ph).toggle();
            var visible = $(code).is(":visible");
            $(node).html(visible ? "&#x2715;" : "&#x25BF;");*/
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    });

});