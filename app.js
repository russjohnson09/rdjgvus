var express = require('express');
var app = express();
var hb = require('express3-handlebars');
var http = require("http");
var config = require("./config");

var m = require("mongodb");

var db = new m.Db('test', new m.Server('localhost', 27017),{safe:false});

db.open(function(err, db) {
    knockoutCollection = db.collection("knockout");
});

app.engine('hbs', hb({extname:'hbs',defaultLayout:"main.hbs"}));
app.set('view engine', 'hbs');
app.use("/",express.static(__dirname + "/public_html"));

app.get('/greetings', function(req, res){
  res.render('index',{greeting:randElement(greetings),title:req.url});
});

app.get("/request",function(req,res){
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
    
    console.log(ip);
    var greeting = randElement(greetings);
    res.writeHead(200, {
  'Content-Type': 'text/html' });
  res.end("<html><head>" + "<meta charset='UTF-8'>" + "</head><body>" + greeting + "</body></html>");
});

app.get("/knockout",function(req,res){
    res.render('knockout',{'greeting':randElement(greetings)});
});

app.post("/knockout",function(req,res){
    knockoutCollection.insert({a:1},{w:1}, function(err, result) {
        res.end("1");
    });
});

app.listen(3000);

var greetings = ["Hello","こんにちは","夜露死苦"];

function randElement(ary) {
        return ary[Math.floor(Math.random() * ary.length)];
    }
