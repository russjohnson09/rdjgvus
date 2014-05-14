var express = require('express');
var app = express();
var hb = require('express3-handlebars');

app.engine('hbs', hb({extname:'hbs',defaultLayout:"main.hbs"}));
app.set('view engine', 'hbs');

app.get('/', function(req, res){
  res.render('index',{greeting:randElement(greetings),title:req.url});
});

app.listen(3000);


var greetings = ["Hello","こんにちは","夜露死苦"]

function randElement(ary) {
        return ary[Math.floor(Math.random() * ary.length)];
    }
