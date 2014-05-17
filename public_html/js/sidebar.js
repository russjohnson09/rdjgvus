(function($) {
    $.fn.sidebar = function() {

        this.find("ul").bind("focusin focusout", function(e) {
            console.log(e);
            $(this).parent("li").trigger(e.type);
            e.preventDefault();
        });

        this.find("li").bind("focusin focusout", function(e) {
            console.log(e);
            console.log($(this).parent("ul"));
            $(this).parent("ul").trigger(e.type);
            e.preventDefault();
        });

        this.find("a").bind("focusin focusout", function(e) {
            console.log(e);
            //this.toggleClass("focus");
            console.log($(this).parent("li"));
            $(this).parent("li").trigger(e.type);
            e.preventDefault();
        });
        //this.toggleClass("show");

        var lvl1 = this.children("ul").children("li");
        //console.log(lvl1);
        var a = lvl1.first().children("a").first();
        //console.log(a);

        a.trigger("focused");

        this.bind("click", function(e) {
            console.log(e);
            //e.preventDefault();
        });

        this.bind("keypress", function(e) {
            console.log(e);
        });

    };
})(jQuery);
