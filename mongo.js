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

var db = new Db('test', new Server('localhost', 27017));

db.open(function(err, db) {
    assert.equal(null, err);
    db.on('close',function(){});
    db.close();
});
