var express = require('express');
var app = express();
var hb = require('express3-handlebars');
var http = require("http");
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var session      = require('express-session');

mongoose.connect('localhost:27017/test');

app.engine('hbs', hb({extname:'hbs',defaultLayout:"empty.hbs"}));
app.set('view engine', 'hbs');
//app.use(express.logger('dev'));
app.use(cookieParser);
app.use(session({ secret: 'russ' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.get('/', function(req, res) {
	res.render('auth');
});
app.get('/login', function(req, res) {
	res.render('login', { message: req.flash('loginMessage') }); 
});
app.get('/signup', function(req, res) {
	res.render('signup', { message: req.flash('signupMessage') });
});

app.get('/profile', isLoggedIn, function(req, res) {
	res.render('profile', {
		user : req.user
	});
});

app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});
	
	
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.redirect('/');
}
app.listen(3000);

var LocalStrategy   = require('passport-local').Strategy;
var User       		= require('./user');
var passport = require('passport');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});
passport.use('local-signup', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
},
function(req, email, password, done) {
    process.nextTick(function() {
    User.findOne({ 'local.email' :  email }, function(err, user) {
        // if there are any errors, return the error
        if (err)
            return done(err);

        // check to see if theres already a user with that email
        if (user) {
            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
        } else {
            var newUser            = new User();
            newUser.local.email    = email;
            newUser.local.password = newUser.generateHash(password);
            newUser.save(function(err) {
                if (err)
                    throw err;
                return done(null, newUser);
            });
        }

    });    

    });

}));
