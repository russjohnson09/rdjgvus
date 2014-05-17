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

var logcollection;

var db = new Db('test', new Server('localhost', 27017),{safe:false});

db.open(function(err, db) {
    logcollection = db.collection("logcollection");
});


require("http").createServer(function(req,res){
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
    logcollection.insert({a:ip},{w:1}, function(err, result) {
        console.log(err);
        console.log(result);
        res.end("success");
    });
}).listen(3000);
