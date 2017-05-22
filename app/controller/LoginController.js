//app/controller/Login.js
var passport = require('passport');
const pool = require('../model/pg');

var LoginController = {
	formLogin : function(req, res) {
		//console.log(req.flash('loginMessage'));
		// render the page and pass in any flash data if it exists
		res.render('login', { message: req.flash('loginMessage')[0] });
	},

	login : function(req, res, next) {
	passport.authenticate('local-login', function(err, user, info) {
		if (err) { return next(err); }
		// Redirect if it fails
		if (!user) { return res.redirect('/login'); }
		req.logIn(user, function(err) {
			if (err) { return next(err); }
			// Redirect if it succeeds
				return res.redirect('/mailbox');
			});
		})(req, res, next),
		function(req, res) {
            //console.log("hello");
            //remember me
            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        }
	},

	formSignup: function(req, res) {
		//console.log(req.flash('signupMessage'));
		//var temp = req.flash('signupMessage')[0];
		//console.log(temp);
		//console.log(req.flash('signupMessage')[0]);
		// render the page and pass in any flash data if it exists
		res.render('signup',{ message: req.flash('signupMessage')[0] });
	},
	
	logout: function(req, res) {
		req.logout();
		res.redirect('/');
	}
	
}

module.exports = LoginController;

