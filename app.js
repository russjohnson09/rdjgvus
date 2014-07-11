var config = require('./config.js');
var u = require('./util_modules/utils.js')({seed:100});
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
var dbUrl = mConfig.url;
var knockoutCollection;
var todos;
var baseUrl = mConfig.baseUrl;
var http = require('http');

var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxy();

var proxyServer = http.createServer(function(req, res) {
    console.log(req.url);
    var u = req.url.substring(0,5);
    if (u != "/mete" && u != "/sock" && u != "/0546" && u != "/1c62") {
      proxy.web(req, res, {
        target: 'http://127.0.0.1:3001'
     });
    }
    else {
      proxy.web(req, res, {
        target: 'http://127.0.0.1:3002'}, function(e) {
            console.log(e);
            }
      );
    }
});

//proxyServer.on('upgrade', function (req, socket, head) {
//  proxy.ws(req, socket, head);
//});

proxyServer.listen(3000);

w.add(w.transports.File, { filename: './error.log' });

w.info(dbUrl);

m.MongoClient.connect(dbUrl, {db : {native_parser: false, server: 
	{socketOptions: {connectTimeoutMS: 500}}}}, 
    function(err, db) {
        if (err) {
            w.info(err);
            w.info("could not connect");
            return;
        }
        w.info("connected");
        knockoutCollection = db.collection("knockout");
        todos = db.collection('todos');
        patients = db.collection('patients');
});

app.engine('hbs', hb({extname:'hbs',defaultLayout:"empty.hbs", 
	helpers: {
		list: function(items,options) {
		  var out = "<ul>";
		  for(var i=0, l=items.length; i<l; i++) {
			out = out + "<li>" + options.fn(items[i]) + "</li>";
		  }
		  return out + "</ul>";
		}}

}));

app.set('view engine', 'hbs');
app.use(bodyparser());
app.use("/",express.static(__dirname + "/public_html"));


app.get('/ben', function(req,res){
    patients.find().toArray(function(err, items) {
        if (err) {
            res.render('ben',{err: 'error'});
            return;
        }
        else {
            res.render('ben',{patients: items});
        }
    });
});

app.get('/benmock', function(req,res){
	var seed = req.param('seed');
	if (seed) {
		u.seed = seed;
	}
	//u.seed = req.seed;
	res.render('ben',{patients: u.getPatientList()});	
});

app.get('/todo', function(req,res){
    res.render('todo',{});
});

app.get('/todo/load', function(req,res){
    
});

app.get('/todo/:uid?',function(req,res){
    var uid = req.params.uid;
    todos.findOne({uid:uid},{w:1},function(err,result) {
        if (err) {
            w.info("error");
            res.end("error");
            return;
        }
        console.log(result);
        if (!result) {
            todos.insert({'uid':uid},{w:1},function(err,result){
                if (err) {
                    res.end("err creating user");
                    return;
                }
                res.end("created new user");
                return;
            });
        }
    });
});

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
  res.end(greeting);
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

app.listen(3001);

var greetings = ["Hello","こんにちは","夜露死苦","你好","Guten morgen"];

function randElement(ary) {
        return ary[Math.floor(Math.random() * ary.length)];
    }
    


//meteor app


process.env['MONGO_URL'] = dbUrl;
process.env['ROOT_URL']=baseUrl + 'meteor'
process.env['PORT']=3002;
require("./ar_man/main.js");
