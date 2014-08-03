var config = require('./config.js');
var express = require('express');
var u = require('./util_modules/utils.js')({seed:100});
var url = require('url');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var app = express();
var https = require('https');
var http = require('http');
var m = require("mongodb");
var ObjectID = m.ObjectID;
var mConfig = config.mongo;
var PROD = config.app.isProd;
var w = require('winston');
var dbUrl = mConfig.url;
var knockoutCollection;
var contacts,employees,quizes,submissions;
var todos;
var http = require('http');
var appPort = config.app.port;
var Pusher = require("pusher");
var pusherOpts = config.pusher;

var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

//configure passport
passport.serializeUser(function(id, done) {
    console.log('serial');
    done(null, id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    users.findOne({_id:ObjectID(id)}, function(err, user) {
        console.log(user);
        done(err, user);
    });
});


function updateUser(user,done) {
    users.save(user,{w:1},function(err,result) { 
        return done(null, user._id || result._id);
    });
}


passport.use(new GoogleStrategy({
    clientID        : config.googleAuth.clientID,
    clientSecret    : config.googleAuth.clientSecret,
    callbackURL     : config.googleAuth.callbackURL,
    passReqToCallback : true
},
function(req, token, refreshToken, profile, done) {
    var user = req.user;
    if (!user) {
        users.findOne({ 'googleId' : profile.id }, function(err, user) {
            if (!user) {
                user = {};
            }
            user.googleToken = token;
            user.googleName  = profile.displayName;
            user.googleEmail = (profile.emails[0].value || '').toLowerCase();
            updateUser(user,done);
        });
    }
    else {
        user.googleId    = profile.id;
        user.googleToken = token;
        user.googleName  = profile.displayName;
        user.googleEmail = (profile.emails[0].value || '').toLowerCase(); // pull the first email
        updateUser(user,done);
    }

}));

app.use(require("body-parser")());
app.use("/",express.static(__dirname + "/public_html"));
app.use("/bower_components/",express.static(__dirname + "/bower_components"));

app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({ extended: true }));

// required for passport
app.use(require('express-session')({secret:config.secret}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions


//configure collections
m.MongoClient.connect(dbUrl, {db : {native_parser: false, server: 
	{socketOptions: {connectTimeoutMS: 500}}}}, 
    function(err, db) {
        if (err) {
            w.info(err);
            w.info("could not connect");
            return;
        }
        w.info("connected");
        knockoutCollection = db.collection("knockout");
        contacts = db.collection('contacts');
        todos = db.collection('todos');
        patients = db.collection('patients');
        employees = db.collection('employees');
        quizes = db.collection("quizes");
        submissions = db.collection("submissions");
        auth = db.collection('auth');
        users = db.collection('users');
});

w.add(w.transports.File, { filename: './error.log' });

w.info(dbUrl);
w.info(pusherOpts);

var pusher = new Pusher(pusherOpts);

app.get("/pusher/update",function(req,res){    
    pusher.trigger('test', 'test', {
      "message": "hello world"
    });
    var greeting = randElement(greetings);
    res.writeHead(200, {
  'Content-Type': 'text/html' });
  res.end('triggered');
    w.info('triggered');
});

app.get('/ben', function(req,res){
    patients.find().toArray(function(err, items) {
        if (err) {
            res.render('ben',{err: 'error'});
            return;
        }
        else {
            res.render('ben',{patients: items});
        }
    });
});

app.get('/benmock', function(req,res){
	var seed = req.param('seed');
	if (seed) {
		u.seed = seed;
	}
	//u.seed = req.seed;
	res.render('ben',{patients: u.getPatientList()});	
});

app.get('/todo/load', function(req,res){
    
});

app.get('/todo/:uid?',function(req,res){
    var uid = req.params.uid;
    todos.findOne({uid:uid},{w:1},function(err,result) {
        if (err) {
            w.info("error");
            res.end("error");
            return;
        }
        console.log(result);
        if (!result) {
            todos.insert({'uid':uid},{w:1},function(err,result){
                if (err) {
                    res.end("err creating user");
                    return;
                }
                res.end("created new user");
                return;
            });
        }
    });
});

app.get('/greetings', function(req, res){
  res.render('index',{greeting:randElement(greetings),title:req.url});
});

app.get("/request",function(req,res){
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
    
    var greeting = randElement(greetings);
    res.writeHead(200, {
  'Content-Type': 'text/html' });
  res.end(greeting);
});

app.get("/testdb", function(req,res) {
m.MongoClient.connect(dbUrl, {db : {native_parser: false, server: {socketOptions: {connectTimeoutMS: 500}}}}, 
    function(err, db) {
        if (err) {
            res.end("could not connect");
            w.info(err);
            return;
        }
        res.end("connected");
});
}
);

app.get("/test", function(req,res){
    if (!knockoutCollection) {
        res.end("No knockoutCollection");
        return;
       }
    else {
    knockoutCollection.find().toArray(function(err, items) {
        if (err) {
            res.end("There was an error");
            w.log("error","Error finding", err);
        }
        res.end("success");
    });
    }
});

app.get("/knockout",function(req,res){
    res.render('knockout',{'greeting':randElement(greetings)});
});

app.post("/knockout/save",function(req,res){
    var cat = req.body.cat;
    if (cat) {
        knockoutCollection.insert({cat:cat},{w:1}, function(err, result) {
            if (err) {
                res.json({txt:err});
            }
            else {
                res.json({txt:"Successfully saved category " + cat});
            }
        });
    }
    else {
        res.json({txt:"Error saving category " + cat});
    }
});

app.get("/knockout/load",function(req,res){
    var val = req.query.x;
    knockoutCollection.find().toArray(function(err, items) {
        if (err) {
            res.json({txt:'error'});
            return;
        }
        res.json(items);
    });
   
});

app.post("/knockout/del",function(req,res){
    var selector;
    if (req.body.id) {
        selector = {"_id":ObjectID(req.body.id)};
    }
    knockoutCollection.remove(selector,{w:1},function(err,result){
        if (err) {
            res.json({txt:err});
        }
        else {
            res.json({txt:result + " category documents have been deleted."});
        }
    });
});

app.post("contact/add",function(req,res) {
    console.log(req.body);
    contacts.insert(req.body,{w:1}, function(err,result) {
        if (err) {
            w.info(err);
            res.json({err:err});
        }
        else {
            w.info(result);
            res.json({result: result});
        }
    });
});

//auth
app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email']}));
		
app.get('/auth/google/callback', passport.authenticate('google', { scope : ['profile', 'email'] ,
		successRedirect : '/quiz',
		failureRedirect : '/quiz'}));

app.get("/quiz/test/userdata",function(req,res){
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress || 'ANON';
    res.json({ip: ip});
});

app.post("/quiz/create",function(req,res){
    var quiz = req.body.quiz;
    var user = req.body.user;
    if (!quiz) {
        res.json({});
    }
    else {
        if (quiz._id) {
            quiz._id = ObjectID(quiz._id);
        }
        if (user._id) {
            quiz.user_id = ObjectID(user._id);
        }
        quizes.save(quiz,{w:1},function(err,result) {
            console.log(err);
            res.json(result);
        });
    }
});

app.post("/quiz",function(req,res){
    var quiz = req.body.quiz;
    var responses = req.body.responses;
    var quiz_id = ObjectID(quiz._id);
    var name = req.body.name;
    submissions.save({name:name,quiz_id:quiz_id,responses:responses},{w:1},function(err,result){
        res.json(result);
    });
});

app.get("/quiz/submissions",function(req,res){
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var quiz_id = ObjectID(query.quiz_id);
    submissions.find({quiz_id:quiz_id},function(err,c){
        c.toArray(function(err,subAry) {
            res.json({submissionsAry:subAry});
        });
    });
});

app.post("/quiz/removeBlank",function(req,res){
    quizes.remove({questions: { $size: 0}},{w:1}, function(err,count) {
        res.json({count:count});
    });
});

app.post("/quiz/test/testquiz",function(req,res){
    //console.log(req);
    var quiz = req.body.quiz;
    if (!quiz) {
        res.json({});
        return;
    }
    var id = quiz.id;
    quizes.find({id:id}, function(err,c) {
        console.log(c);
        c.count(function(err,count) {
            if (count == 0) {
                console.log(1);
                quizes.insert(quiz, {w:1}, function(err,result) {
                    w.info("inserted");
                    w.info(result);
                    res.json(result);
                });
            }
            else {
                c.nextObject(function(err,item) {
                    w.info("found");
                    w.info(item);
                    res.json(item);
                });
            };
        });
    });
});

app.get("/quiz/quiz-list",function(req,res){
    quizes.find({active:true}, function(err,c) {
        var quizAry = [];
        c.each(function(err,quiz) {
            if(quiz == null) {
                res.json({quizAry:quizAry});
                return;
            }
            quizAry.push(quiz);
        });
    });
});

app.post("/quiz/removeAll",function(req,res){
    submissions.remove({}, function(err,submissions_count) {
        quizes.remove({},function(err,count) {
            res.json({submissions_count:submissions_count,quizes_count:count});
        });
    });
    
    users.remove({},function(err,count){});
});

app.post("/quiz/test/submit",function(req,res){
    //console.log(req.body);
    var _id = ObjectID(req.body['quiz_id']);
    var responses = req.body.responses;
    var user_id = req.body['user_id'];
    //console.log(_id);
    console.log(responses);
    quizes.findOne({_id:_id},function(err,quiz){
        //console.log(quiz);
        if (quiz) {
            submissions.update({id:user_id},{id:user_id,quiz_id:_id,responses:responses},
            {upsert:true,w:1},function(err,result) {
                //res.json(result);
               submissions.find({quiz_id:_id},function(err,c){
                    c.toArray(function(err,submissionsAry) {
                        console.log(submissionsAry);
                        res.json({user_submissions:submissionsAry});
                    });
               });
            });
        }
        else {
            res.json({});
        }
    });
});

app.get("/arman/employees",function(req,res) {
    employees.find().toArray(function(err, items) {
        if (err) {
            res.json({error:'error'});
            return;
        }
        res.json(items);
    });
});

app.get("/arman/lists",function(req,res) {
    contacts.distinct('paytype',function(err,docs) {
        res.json({'paytypes':docs});
    });
});

app.post("/arman/addemployee", function(req,res) {
    console.log(req.body);
    employees.insert(req.body,{w:1}, function(err,result) {
        if (err) {
            res.json({error:err});
        }
        else {
            res.json({result: result + " added."});
        }
    });
});

app.post("/arman/clear", function(req,res) {
    employees.remove({},{w:1},function(err,result){
        if (err) {
            res.json({txt:err});
        }
        else {
            res.json({txt:result + " employees have been deleted."});
        }
    });
});

app.get("/contacts/load",function(req,res) {
    var val = req.query.x;
    contacts.find().toArray(function(err, items) {
        if (err) {
            res.json({error:'error'});
            return;
        }
        res.json(items);
    });
});

app.post("/contacts/add",function(req,res) {
    console.log(req.body);
    contacts.insert(req.body,{w:1}, function(err,result) {
        if (err) {
            res.json({error:err});
        }
        else {
            res.json({result: result + " added."});
        }
    });
});

app.get("/contacts/getsex",function(req,res) {
    //console.log(contacts);
    contacts.distinct('sex',function(err,docs) {
        console.log(docs);
        res.json(docs);
    });
});
	
app.get('/current-user',function(req,res){
    res.json(req.user);
});

app.get('/user',function(req,res) {
    console.log(req);
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    console.log(query);
    var _id = ObjectID(query.user_id);
    users.findOne({_id:_id},function(err,item){
        res.json({user:item});
    });
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/quiz');
});

var greetings = ["Hello","こんにちは","夜露死苦","你好","Guten morgen"];

function randElement(ary) {
        return ary[Math.floor(Math.random() * ary.length)];
    }

http.createServer(app).listen(appPort);


w.info('server started');
