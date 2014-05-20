var config = require('./config.js');
var gp = config.getPocket;
var express = require('express');
var app = express();
var oauth = require('oauth');
var request = require('request');


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
	//consumer.getOAuthRequestToken(function(err, oauthToken, oauthTokenSecret, results){
	//    console.log(err);
	//    console.log(oauthToken);
	//    console.log(results);
	//});
	for (k in gp.headers) {
	    res.setHeader(k,gp.headers[k]);
	}
	console.log(res);
	res.redirect(gp.domain + gp.request +  "?consumer_key=" + gp.consumerKey +
	"&redirect_uri=" + config.domain + gp.redirectUrl);
});

app.listen(3000);
