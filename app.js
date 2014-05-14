var express = require('express');
var app = express();
var hb = require('express3-handlebars');

app.engine('hbs', hb({extname:'hbs',defaultLayout:"main.hbs"}));
app.set('view engine', 'hbs');

app.get('/', function(req, res){
  res.render('index',{greeting:"hello",title:req.url});
});

app.listen(3000);
