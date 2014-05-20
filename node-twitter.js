var app = require('express')();

var t = require('./config.js').twitter;

var twitter = new require('node-twitter-api')({
    consumerKey: t.apiKey,
    consumerSecret: t.apiSecret,
    callback: 'http://127.0.0.1/auth'
    } 
);

twitter.getRequestToken(function(error, requestToken, requestTokenSecret, results){
    if (error) {
        console.log(error);
    } else {
        console.log(requestToken);
    }
});

app.listen(3000);

