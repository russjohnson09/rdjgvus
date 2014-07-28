(function($) {

    $.fn.tableView = function(options) {
        var options = $.extend({}, options, $.tableSelect.defaults);
        var data = {};
        var selector = this.selector;
        var trs = this.find('tr');
        var selectedClass = options.selectedClass;
        var currentRow;
        var table = this;
        
        table.options = options;

        this.bind("addRow", function(e, row) {
            trs = $(selector).find("tr");
            row.bind("click", _select);
            table.trigger("update");
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
        
        this.applyBindings = function(db) {
            data = db;
            
            data.bind("add", function(rec) {
                addRec(rec);
            });
            
            data.bind("remove", function(rec) {
                
            });
            
            data.bind("connected", function() {
                var thead = $("<thead>");
                thead.append($("<tr><th>First Name</th><th>Last Name</th><th>Sex</th><th>Phone</th></tr>"));
                table.append(thead);
                var tbody = $("<tbody>");
                table.append(tbody);
            });
        };
        
        trs.bind("click", _select);
        
        function addRec(rec) {
            trs.add()
        }
        
        function getRow(rec,key) {
            var tr = $("<tr>");
            tr.append($("<td>" + rec.fname + "</td>"));
            tr.append($("<td>" + rec.lname + "</td>"));
            tr.append($("<td>" + rec.sex + "</td>"));
            tr.append($("<td>" + rec.phone + "</td>"));
            tr.data("id",key);
            return tr;
        }
        
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

    $.tableView = {
        defaults : {
            selectedClass : "selected",
            surnames : ["Smith", "Johnson", "Brown", "鬼龍院"],
            givennames : ["Russ", "Rachel", "Kat", "皐月"],
            sexes : ["Male", "Female"],
            rows : 10,
            class : "tablesorter-blue tableSelect-default"
        }
    };
    $.tableView.utils = {};
    var self = $.tableView.utils;
    self.genSurname = function() {
        return randElement(self.defaults.surnames);
    };
    self.genGiven = function() {
        return randElement(self.defaults.givennames);
    };
    self.genPhone = function() {
        var result = "";
        for (var i = 0; i < 10; i++) {
            result += Math.floor(Math.random() * 10).toString();
        }
        return result;
    };
    
    self.genSex = function() {
        return randElement(self.defaults.sexes);
    };
    
    self.genRow = function() {
        var tr = $("<tr>");
        tr.append($("<td>" + self.genGiven() + "</td>"));
        tr.append($("<td>" + self.genSurname() + "</td>"));
        tr.append($("<td>" + self.genSex() + "</td>"));
        tr.append($("<td>" + self.genPhone() + "</td>"));
        return tr;
    };

    self.genContact = function(options) {
        return {
            fname : self.genGiven(),
            lname : self.genSurname(),
            phone : self.genPhone(),
            sex : self.genSex()
        };
    };

    self.genTable = function(options) {
        var opts = $.extend({}, self.defaults, options);
        var rows = opts.rows;
        var table = $("<table>");
        var thead = $("<thead>");
        thead.append($("<tr><th>First Name</th><th>Last Name</th><th>Sex</th><th>Phone</th></tr>"));
        table.append($(thead));
        var tbody = $("<tbody>");
        for (var i = 0; i < rows; i++) {
            tbody.append(self.genRow());
        }
        table.append(tbody);
        return table.addClass(opts.class);
    };
}
)(jQuery);
