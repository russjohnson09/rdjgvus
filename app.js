var express = require('express');
var app = express();
var hb = require('express3-handlebars');
var http = require("http");
var config = require("./config");

app.engine('hbs', hb({extname:'hbs',defaultLayout:"main.hbs"}));
app.set('view engine', 'hbs');

app.get('/greetings', function(req, res){
  res.render('index',{greeting:randElement(greetings),title:req.url});
});

app.get("/request",function(req,res){
  var post_options = {
      host: 'getpocket.com',
      path: '/v3/oauth/request',
      port: 3000,
      method: 'POST',
      headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Accept': 'application/json'
      }
  };

  // Set up the request
  var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
      });
  });

    console.log(req.url);
    var greeting = randElement(greetings);
    res.writeHead(200, {
  'Content-Type': 'text/plain' });
  res.end(greeting);
});

app.use("/",express.static(__dirname + "/public_html"));
app.listen(3000);

var greetings = ["Hello","こんにちは","夜露死苦"];

function randElement(ary) {
        return ary[Math.floor(Math.random() * ary.length)];
    }
