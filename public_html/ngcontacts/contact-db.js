(function($) {
    $.contactTable = {
        defaults : {
            dbName : "contacts",
            ver : 1.1,
            tableClass : "contactTable",
            type: "indexed"
        }
    };
    
    $.contactTable.utils = {
        defaults : {
            surnames : ["Smith", "Johnson", "Brown", "鬼龍院"],
            givennames : ["Russ", "Rachel", "Kat", "皐月"],
            sexes : ["Male", "Female"],
            rows : 10,
            class : "tablesorter-blue tableSelect-default"
        }
    };
    
    var self = $.contactTable.utils;
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


    $.fn.contactTable = function(options) {
        var db;
        var opts = $.extend({}, $.contactTable.defaults, options);
        var dbName = opts.dbName;
        var ver = opts.ver;
        var res = indexedDB.open(dbName, ver);
        var table = this;
        var sexList = [];
        var fNames = [];
        var lNames = [];
        var phones = [];

        res.onsuccess = function(e) {
            db = e.target.result;
            table.trigger("connected");
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

        table.bind("connected", function(e) {
            var thead = $("<thead>");
            thead.append($("<tr><th>First Name</th><th>Last Name</th><th>Sex</th><th>Phone</th></tr>"));
            table.append(thead);
            var tbody = $("<tbody>");
            table.append(tbody);
            var tx = db.transaction(["contact"]);
            var c = tx.objectStore("contact").openCursor(IDBKeyRange.lowerBound(0));
            tx.oncomplete = function(e) {
                table.trigger("loadComp");
            };

            c.onsuccess = function(e) {
                var res = e.target.result;
                if (!res) {
                    return;
                }
                var sex = res.value.sex
                if (typeof sex == "string" && sex.length > 0 &&
                    sexList.indexOf(sex) < 0) {
                    sexList.push(sex);
                }
                var fname = res.value.fname;
                if (typeof fname == "string" && fname.length > 0 &&
                    fNames.indexOf(fname) < 0) {
                    fNames.push(fname);
                }
                var lname = res.value.lname;
                if (typeof lname == "string" && lname.length > 0 &&
                    lNames.indexOf(lname) < 0) {
                    lNames.push(lname);
                }
                tbody.append(getRow(res.value,res.key));
                res.continue();
            };

        });

        table.bind("addRec", function(e, rec) {
            addRec(db,rec,{type:opts.type,
            onsuccess: function(rec,key) {
                    var resort;
                    var tr = getRow(rec,key);
                    table.find("tbody").append(tr);
                    table.trigger('addRow', [tr,resort]);
                    console.log(key);
                    console.log("successfully added record", rec);
                }
            });
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
                table.trigger("err");
            };
        });
        
        table.getSexList = function() {
            return sexList;
        }
        
        table.getFNames = function() {
            return fNames;
        }
        
        table.getLNames = function() {
            return lNames;
        }

        return table;
    };
    
    function randElement(ary) {
        return ary[Math.floor(Math.random() * ary.length)];
    }
    
    function addRec(db,rec,opts) {
        if (opts.type == "mongo") {
            $.ajax({
            data: {rec:rec},
           	type: 'POST',
            url: "/contact/save",
            }).done(function(data,status,xhr) {
                console.log(data);
            }).fail(function(xhr,status,err){
                console.log(err);
            });
        }
        else if (opts.type == "indexed") {
            var tx = db.transaction(["contact"], "readwrite");
            var os = tx.objectStore("contact");
            var req = os.put(rec);
            req.onsuccess = function(e) {
                var key = e.originalTarget.result;
                opts.onsuccess(rec,key);
            };
            req.onerror = function(e) {
                console.log("Error", e);
                table.trigger("err");
            };
        }
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
})(jQuery);
