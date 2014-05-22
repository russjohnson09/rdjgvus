var config = require('./config.js') || require('./server-config.js');
var express = require('express');
var app = express();
var hb = require('express3-handlebars');
var http = require("http");
var bodyparser = require("body-parser");
var m = require("mongodb");
var ObjectID = m.ObjectID;
var mConfig = config.mongo;
var PROD = config.isPROD;
var w = require('winston');
var dbUrl = "";
var knockoutCollection;

if (process.argv) {
    PROD = PROD || process.argv[2];
}

w.add(w.transports.File, { filename: './error.log' });


if (PROD) {
    dbUrl = mConfig.remoteDb;
}
else {
     dbUrl = "mongodb://" + mConfig.host + ":" + mConfig.port + "/" + mConfig.db;
}

m.MongoClient.connect(dbUrl, {db : {native_parser: false, server: {socketOptions: {connectTimeoutMS: 500}}}}, 
    function(err, db) {
        if (err) {
            w.info(err);
            w.info("could not connect");
            return;
        }
        w.info("connected");
        knockoutCollection = db.collection("knockout");
});

app.engine('hbs', hb({extname:'hbs',defaultLayout:"empty.hbs"}));
app.set('view engine', 'hbs');
app.use(bodyparser());
app.use("/",express.static(__dirname + "/public_html"));

app.get('/greetings', function(req, res){
  res.render('index',{greeting:randElement(greetings),title:req.url});
});

app.get("/request",function(req,res){
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
    
    var greeting = randElement(greetings);
    res.writeHead(200, {
  'Content-Type': 'text/html' });
  res.end("<html><head>" + "<meta charset='UTF-8'>" + "</head><body>" + greeting + "</body></html>");
});

app.get("/testdb", function(req,res) {
m.MongoClient.connect(dbUrl, {db : {native_parser: false, server: {socketOptions: {connectTimeoutMS: 500}}}}, 
    function(err, db) {
        if (err) {
            res.end("could not connect");
            w.info(err);
            return;
        }
        res.end("connected");
});
}
);

app.get("/test", function(req,res){
    if (!knockoutCollection) {
        res.end("No knockoutCollection");
        return;
       }
    else {
    knockoutCollection.find().toArray(function(err, items) {
        if (err) {
            res.end("There was an error");
            w.log("error","Error finding", err);
        }
        res.end("success");
    });
    }
});

app.get("/knockout",function(req,res){
    res.render('knockout',{'greeting':randElement(greetings)});
});

app.post("/knockout/save",function(req,res){
    var cat = req.body.cat;
    if (cat) {
        knockoutCollection.insert({cat:cat},{w:1}, function(err, result) {
            if (err) {
                res.json({txt:err});
            }
            else {
                res.json({txt:"Successfully saved category " + cat});
            }
        });
    }
    else {
        res.json({txt:"Error saving category " + cat});
    }
});

app.get("/knockout/load",function(req,res){
    var val = req.query.x;
    knockoutCollection.find().toArray(function(err, items) {
        if (err) {
            res.json({txt:'error'});
            return;
        }
        res.json(items);
    });
   
});

app.post("/knockout/del",function(req,res){
    var selector;
    if (req.body.id) {
        selector = {"_id":ObjectID(req.body.id)};
    }
    knockoutCollection.remove(selector,{w:1},function(err,result){
        if (err) {
            res.json({txt:err});
        }
        else {
            res.json({txt:result + " category documents have been deleted."});
        }
    });
});

app.listen(3000);

var greetings = ["Hello","こんにちは","夜露死苦"];

function randElement(ary) {
        return ary[Math.floor(Math.random() * ary.length)];
    }
