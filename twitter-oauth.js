var app = require('express')();
var config = require('./config.js');
var t = config.twitter;
var cookieParser = require('cookie-parser');
var session      = require('express-session');
app.use(cookieParser());
app.use(session({secret:config.secret}));

var auth = require('twitter-oauth')({
        consumerKey: t.apiKey,
        domain: 'http://127.0.0.1:3000',
     consumerSecret: t.apiSecret,
      loginCallback: "/callback",
   completeCallback:  "/search/beagles"
});

app.get('', function(req, res,next){
    //console.log(res);
    //res.end("1");
    //console.log(next);
    auth.oauthConnect(req,res,next);
    });

app.get('/callback', auth.oauthCallback);// function(req,res,next){
    //console.log(res);
    //auth.oauthCallback(req,res,next);
//});
app.get('/complete',function(req,res){
    console.log(res);
})
app.get('/twitter/sessions/logout', auth.logout);


app.listen(3000);
