(function($) {
    $.fn.showHide = function(options) {
        var divContainer = this;
        var table = divContainer.find("table");
        var chkBoxes = $("<div class='showHide'>");

        table.find("th").each(function(ix, el) {
            var th = $(el);
            var chkBox = $("<label>").text(th.text()).append($("<input type='checkbox'>"));
            var column = table.find("tr :nth-child(" + (ix+1) +")");
            chkBox.bind("click", function(e) {
                column.toggleClass("hidden");
            });
            chkBoxes.append(chkBox);
        });
        
        divContainer.append(chkBoxes);
        
        return this;
    };
})(jQuery);
