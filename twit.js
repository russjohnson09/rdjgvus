var c = require("./config").twitter;

var Twit = require('twit');

//console.log(c);
console.log(c.apiKey);
console.log(c.apiSecret);
console.log(c.accessToken);
console.log(c.accessTokenSecret);


var T = new Twit({
    consumer_key: c.apiKey,
    consumer_secret: c.apiSecret,
    access_token: c.accessToken,
    access_token_secret: c.accessTokenSecret
});
/*
T.post('statuses/update', { status: 'hello world!' }, function(err, data, response) {
  console.log(err);
})
*/
//console.log(T);

//
//  tweet 'hello world!'
//
T.get('search/tweets', { q: 'banana since:2011-11-11', count: 100 }, function(err, data, res) {
  console.log(data);
  //console.log(err);
  //console.log(res);
});
