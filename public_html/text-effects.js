(function($) {

    $.fn.scroll = function(options) {
        var opts = $.extend({}, $.fn.scroll.defaults, options);

        return this.each(function() {
            var scrollContainer = $(this);

            function begin() {
                scrollContainer.fadeIn(1000).delay(1000).fadeOut(1000);
            }

            begin();
            scrollContainer.bind("update", function() {
                begin();
            });
        });
    };

    $.fn.scroll.defaults = {
    };
})(jQuery);
