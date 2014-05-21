var config = require('./config.js') || require('./server-config.js');
var express = require('express');
var app = express();
var hb = require('express3-handlebars');
var http = require("http");
var bodyparser = require("body-parser");
var m = require("mongodb");
var ObjectID = m.ObjectID;
var mConfig = config.mongo;
var PROD = false;
var w = require('winston');

w.add(w.transports.File, { filename: './error.log' });


var db = new m.Db(mConfig.db, new m.Server(mConfig.domain, mConfig.port),{safe:false});

db.open(function(err, client) {
    if (mConfig.user) {
    client.authenticate(mConfig.user, mConfig.pass, function(err, success) {
        knockoutCollection = db.collection("knockout");
        w.info(err);
    });
    }
    else {
        w.info('success db');
        knockoutCollection = db.collection("knockout");
    }
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
    knockoutCollection.find();
    var val = req.query.x;
    //res.json({'x':1});
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
