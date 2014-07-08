(function($) {

    $.fn.tableSelect = function(options) {
        var options = $.extend({}, options, $.tableSelect.defaults);
        var selector = this.selector;
        var trs = this.find('tr');
        var selectedClass = options.selectedClass;
        var currentRow;
        var table = this;

        this.bind("addRow", function(e, row) {
            trs = $(selector).find("tr");
            row.bind("click", _select);
        });
        
        this.bind("sortEnd update", function(e) {
            trs = $(this).find('tr');
        });
        
        this.bind("removeRows", function(e) {
            $(this).find("tbody tr." + selectedClass).each(function (ix,el) {
                table.trigger("removeRec",[$(el).data("id")]);
                $(el).remove();
            });
            table.trigger("update");
        });
        
        trs.bind("click", _select);
        
        function _select(e) {
            if (e.ctrlKey) {
                $(this).toggleClass(selectedClass);
            } else if (e.shiftKey && currentRow) {
                trs.removeClass(selectedClass);
                var start = trs.index(currentRow);
                var end = trs.index(this);
                if (start > end) {
                    var tmp = start;
                    start = end;
                    end = tmp;
                }
                for (var i = start; i <= end; i++) {
                    $(trs[i]).addClass(selectedClass);
                }
            } else {
                trs.removeClass(selectedClass);
                $(this).addClass(selectedClass);
            }

            currentRow = this;
        }

        return this;
    };

    $.tableSelect = {
        defaults : {
            selectedClass : "selected",
        }
    };

}
)(jQuery);
