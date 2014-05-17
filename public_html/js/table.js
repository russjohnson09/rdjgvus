(function($) {

    $.testData = {
        surnames : ["Smith", "Johnson", "Brown", "鬼龍院"],
        givennames : ["Russ", "Rachel", "Kat", "皐月"],
        genSurname : function() {
            return randElement($.testData.surnames);
        },
        genGiven : function() {
            return randElement($.testData.givennames);
        },
        genPhone : function() {
            var result = "";
            for (var i = 0; i < 10; i++) {
                result += Math.floor(Math.random() * 10).toString();
            }
            return result;
        },
        sexes : ["Male", "Female"],
        genSex : function() {
            return randElement($.testData.sexes);
        },
        genRow : function() {
            var tr = $("<tr>");
            tr.append($("<td>" + $.testData.genGiven() + "</td>"));
            tr.append($("<td>" + $.testData.genSurname() + "</td>"));
            tr.append($("<td>" + $.testData.genSex() + "</td>"));
            tr.append($("<td>" + $.testData.genPhone() + "</td>"));
            return tr;
        },

        genContact : function(options) {
            return {
                fname : $.testData.genGiven(),
                lname : $.testData.genSurname(),
                phone : $.testData.genPhone(),
                sex : $.testData.genSex()
            };
        },

        genTable : function(options) {
            var opt = $.extend({}, $.testData.genTableOptions, options);
            var rows = opt.rows;
            var table = $("<table>");
            var thead = $("<thead>");
            thead.append($("<tr><th>First Name</th><th>Last Name</th><th>Sex</th><th>Phone</th></tr>"));
            table.append($(thead));
            var tbody = $("<tbody>");
            for (var i = 0; i < rows; i++) {
                tbody.append($.testData.genRow());
            }
            table.append(tbody);
            return table.addClass(opt.class);
        },
        genTableOptions : {
            rows : 10,
            class : "tablesorter-blue tableSelect-default"
        }
    };

    function randElement(ary) {
        return ary[Math.floor(Math.random() * ary.length)];
    }

})(jQuery);
