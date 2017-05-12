// app/routes.js

var WelcomeController = require('../app/controller/WelcomeController');
var MailController = require('../app/controller/MailController');
var LoginController = require('../app/controller/LoginController');

module.exports = function(app, passport,pool) {

	
	app.get('/', WelcomeController.index);

	app.get('/mailbox', isLoggedIn, MailController.mailbox);

	app.get('/api-mailbox', isLoggedIn, MailController.apimailbox);


	app.get('/sentbox', isLoggedIn, MailController.sentbox);

	app.get('/compose', isLoggedIn, MailController.compose);

	app.post('/compose', isLoggedIn, MailController.postcompose);

	app.get('/read/:id', isLoggedIn, MailController.read);


	app.get('/readsent/:id', isLoggedIn, MailController.readsent);


	// show the login form
	app.get('/login', Logged, LoginController.formLogin);

	// process the login form
	app.post('/login', LoginController.login);


	app.get('/sign-up', LoginController.formSignup);

	// process the signup form
	app.post('/sign-up', passport.authenticate('local-signup', {
		successRedirect : '/mailbox', // redirect to the secure profile section
		failureRedirect : '/sign-up', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));


	app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['email','user_friends'] }));

	// handle the callback after facebook has authenticated the user
	app.get('/auth/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect : '/mailbox',
			failureRedirect : '/login'
		}));

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', LoginController.logout);

		

};

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}

function Logged(req, res, next) {

	// if user isnt authenticated in the session, carry on
	if (!req.isAuthenticated())
		return next();

	// if they are redirect them to the home page
	res.redirect('/');
}
