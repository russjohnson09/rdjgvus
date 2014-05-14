(function($) {

    $.contactTable = {
        options : {
            dbName : "contacts",
            ver : 1.1,
            tableClass : ""
        }
    };

    $.fn.contactTable = function(options) {
        var db;
        var opts = $.extend({}, $.contactTable.options, options);
        var dbName = opts.dbName;
        var ver = opts.ver;
        var res = indexedDB.open(dbName, ver);
        var table = this;

        res.onsuccess = function(e) {
            db = e.target.result;
            table.trigger("contactDBConnected");
        };

        res.onupgradeneeded = function(e) {
            db = e.target.result;
            if (db.objectStoreNames.contains('contact')) {
                db.deleteObjectStore('contact');
            }
            db.createObjectStore('contact', {
                autoIncrement : true
            });
        };

        table.bind("contactDBConnected", function(e) {
            var thead = $("<thead>");
            thead.append($("<tr><th>First Name</th><th>Last Name</th><th>Sex</th><th>Phone</th></tr>"));
            table.append(thead);
            var tbody = $("<tbody>");
            table.append(tbody);
            var tx = db.transaction(["contact"]);
            var c = tx.objectStore("contact").openCursor(IDBKeyRange.lowerBound(0));
            tx.oncomplete = function(e) {
                table.trigger("contactTableComplete");
            };

            c.onsuccess = function(e) {
                var res = e.target.result;
                if (!res)
                    return;
                tbody.append(getRow(res.value,res.key));
                res.
                continue();
            };

        });

        table.bind("addRec", function(e, rec) {
            table.find("tbody").append(getRow(rec));
            var tx = db.transaction(["contact"], "readwrite");
            var os = tx.objectStore("contact");
            var req = os.put(rec);
            req.onsuccess = function(e) {
                //console.log("successfully added record", rec);
            };
            req.onerror = function(e) {
                console.log("Error", e);
            };
        });

        table.bind("removeRec", function(e, recId) {
            var tx = db.transaction(["contact"], "readwrite");
            var os = tx.objectStore("contact");
            var req = os.delete(recId);
            req.onsuccess = function(e) {
              console.log("successfully removed record", recId);  
            };
            req.onerror = function(e) {
                console.log("Error removing", e);
            };
        });

        function getRow(rec,key) {
            //console.log(key);
            var tr = $("<tr>");
            tr.append($("<td>" + rec.fname + "</td>"));
            tr.append($("<td>" + rec.lname + "</td>"));
            tr.append($("<td>" + rec.sex + "</td>"));
            tr.append($("<td>" + rec.phone + "</td>"));
            tr.data("id",key);
            return tr;
        }

        return this;
    };
})(jQuery);
