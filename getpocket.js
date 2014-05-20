var config = require('./config.js');
var gp = config.getPocket;
var express = require('express');
var app = express();
var oauth = require('oauth');
var request = require('request');
var qs = require('qs');


var cookieParser = require('cookie-parser');
var session      = require('express-session');
app.use(cookieParser());
app.use(session({ secret: config.secret  }));

var consumer = new oauth.OAuth(
    "https://getpocket.com/v3/oauth/request",
    "https://getpocket.com/v3/oauth/authorize",
    gp.consumerKey,
    gp.consumerSecret,
    "1.0A",
    gp.domain + gp.callback,
    "HMAC-SHA1"
  );


app.get('/', function(req, res) {
    request.post({headers : gp.headers,
        url: gp.domain + gp.request,
        body: qs.stringify({
        consumer_key: gp.consumerKey,
        redirect_uri: config.domain + gp.redirect
        })}, function(e, r, body) {
            console.log(e);
            console.log(r);
            console.log(result);
        });
});


    request.post({headers : gp.headers,
        url: gp.domain + gp.request,
        body: qs.stringify({
        consumer_key: gp.consumerKey,
        redirect_uri: config.domain + gp.redirect
        })}, function(e, r, body) {
            console.log(e);
            //console.log(r);
            console.log(body);
        });

app.listen(3000);
