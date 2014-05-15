var express = require('express');
var app = express();
var hb = require('express3-handlebars');
var http = require("http");

app.engine('hbs', hb({extname:'hbs',defaultLayout:"main.hbs"}));
app.set('view engine', 'hbs');

app.get('/handlebars', function(req, res){
  res.render('index',{greeting:randElement(greetings),title:req.url});
});

app.use(express.static(__dirname + "/public_html"));
app.listen(3000);

var static = require('node-static');
var file = new static.Server('./public');

http.createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
}).listen(8080);



var greetings = ["Hello","こんにちは","夜露死苦"]

function randElement(ary) {
        return ary[Math.floor(Math.random() * ary.length)];
    }
