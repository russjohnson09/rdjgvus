var OAuth = require('oauth').OAuth;
var config = require('./config.js');
var express = require('express');
console.log(config.twitter);
var twitter = config.twitter;
var app = express();
var host = config.host

function getAuth(){
    return new OAuth(
	twitter.requestTokenUrl,
	twitter.accessTokenUrl,
	twitter.apiKey,
	twitter.apiSecret,
	twitter.oauthVer,
	host + twitter.callbackUrl,
	twitter.hmac
    );
}
 
app.get('/sessions/connect', function(req, res){
    var oAuth = getAuth();
    console.log(oAuth);
    oAuth.getOAuthRequestToken(function(err,oauthToken,oauthTokenSecret,results){
        if (err) { res.send('error');
        console.log(err);
        }
        else {
            req.session.oauthRequestToken = oauthToken;
            req.session.oauthRequestTokenSecret = oauthTokenSecret;
            res.redirect(twitter.authorizeUrl +"?oauth_token=" + req.session.oauthRequestToken);
        }
    });
    });
 
app.get(twitter.callbackUrl, function(req, res){
    var oAuth = getAuth();
    oAuth.getOAuthAccessToken(req.session.oauthRequestToken,
     req.session.oauthRequestTokenSecret, 
     req.query.oauth_verifier, 
     function(err, oauthAccessToken, oauthAccessTokenSecret, results) {
        console.log(err);
        console.log(results);
     });
});

app.listen(3000);
/**
if (error) {
res.send("Error getting OAuth access token : " + sys.inspect(error) + "["+oauthAccessToken+"]"+ "["+oauthAccessTokenSecret+"]"+ "["+sys.inspect(results)+"]", 500);
} else {
req.session.oauthAccessToken = oauthAccessToken;
req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
// Right here is where we would write out some nice user stuff
consumer.get("http://twitter.com/account/verify_credentials.json", req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
if (error) {
res.send("Error getting twitter screen name : " + sys.inspect(error), 500);
} else {
req.session.twitterScreenName = data["screen_name"];
res.send('You are signed in: ' + req.session.twitterScreenName)
}
});
}
});
});
**/
