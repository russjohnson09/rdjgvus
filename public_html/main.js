$(function() {
    var divContainer = $("#contacts-container");
    var table = $("#contactsTable");
    table.contactTable();
    table.bind("contactTableComplete", function(e) {
        table.tablesorter().tableSelect();
        divContainer.showHide();
        $("html").bind("keypress", function(e) {
            if (e.key == "Del") {
                $("tr.selected").each(function(ix, el) {
                    var recId = $(el).data("id");
                    console.log(recId);
                    table.trigger("removeRec", [recId]);
                });
                table.trigger("removeRows");
            }
        });
    });
    table.bind("removeRow", function(e, row) {
        var recId = $(el).data("id");
        table.trigger("removeRec", [recId]);
    });
    table.bind("rowsRemoved", function(e, rows) {
        rows.each(function(ix, el) {
            var recId = $(el).data("id");
            console.log(recId);
            table.trigger("removeRec", [recId]);
        });
    });

    $("#gen").bind("click", function() {
        var contact = $.testData.genContact();
        table.trigger("addRec", [contact]);
    });

    $("#addContact").bind("click", function(e) {
        e.preventDefault();
        table.trigger("addRec", [{
            fname : $("#fname").val(),
            lname : $("#lname").val(),
            sex : $("#sex").val(),
            phone : $("#phone").val()
        }]);
    });
}); 