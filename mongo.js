var m = require("mongodb");
var Db = m.Db,
MongoClient = m.MongoClient,
Server = m.Server,
ReplSetServers = m.ReplSetServers,
ObjectID = m.ObjectID,
Binary = m.Binary,
GridStore = m.GridStore,
Grid = m.Grid,
Code = m.Code,
BSON = m.pure().BSON,
assert = require('assert');

var db = new Db('test', new Server('localhost', 27017),{safe:false});

db.open(function(err, db) {
    var collection = db.collection("test");
    collection.insert({a:2},{w:1}, function(err, result) {
        console.log(err);
        console.log(result);
    });
    db.close();
});

