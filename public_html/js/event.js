$(function() {
    var menuItems = $("#menu a");
    menuItems[0].focus();
    $("html").bind("keydown", function(e) {
        console.log(e.which);
        if (e.which == 40) {//down
            var ix = $("#menu a:focus").index();
            console.log(ix);
            menuItems[(ix + 1) % menuItems.length].focus();
        } else if (e.which == 38) {//up
            var ix = $("#menu a:focus").index();
            console.log(ix);
            menuItems[(ix - 1) % menuItems.length].focus();
        } else if (e.which == 13) {//enter
            var ix = $("#menu a:focus").index();
            if (ix > -1) {
                menuItems[ix].click();
            }
        }
    });
    
});
