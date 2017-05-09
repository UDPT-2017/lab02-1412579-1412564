// app/routes.js

module.exports = function(app, passport,pool) {

	//multer help upload fille quickly, it image here
	var multer  = require('multer')
		
	var storage = multer.diskStorage({
	    destination: function (req, file, cb) {
	        cb(null, 'public/images/')
	    },
	    filename: function (req, file, cb) {
	        cb(null, Date.now() +"-" + file.originalname);
	  }
	})

	var upload = multer({ storage: storage })

	var fs = require('fs');
	var dateFormat = require('dateformat');
	var now = new Date();

	var slug = require('slug');


	app.get('/', function(req, res) {
		res.render('index'); // load the index.ejs file
	});

	app.get('/mailbox/:id', function(req, res) {
		res.render('mailbox'); // load the index.ejs file
	});

	app.get('/compose-email', function(req, res) {
		res.render('compose'); // load the index.ejs file
	});

	app.get('/read-email', function(req, res) {
		res.render('reademail'); // load the index.ejs file
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', Logged, function(req, res) {
		//console.log(req.flash('loginMessage'));
		// render the page and pass in any flash data if it exists
		res.render('login', { message: req.flash('loginMessage')[0] });
	});

	// process the login form
	app.post('/login', function(req, res, next) {
	passport.authenticate('local-login', function(err, user, info) {
		if (err) { return next(err); }
		// Redirect if it fails
		if (!user) { return res.redirect('/login'); }
		req.logIn(user, function(err) {
			if (err) { return next(err); }
			// Redirect if it succeeds
				return res.redirect('/mailbox/'+user.id);
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
	});

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/sign-up', function(req, res) {
		//console.log(req.flash('signupMessage'));
		//var temp = req.flash('signupMessage')[0];
		//console.log(temp);
		//console.log(req.flash('signupMessage')[0]);
		// render the page and pass in any flash data if it exists
		res.render('signup',{ message: req.flash('signupMessage')[0] });
	});

	// process the signup form
	app.post('/sign-up', passport.authenticate('local-signup', {
		successRedirect : '/mailbox', // redirect to the secure profile section
		failureRedirect : '/sign-up', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)

	// =====================================
	// FACEBOOK ROUTES =====================
	// =====================================
	// route for facebook authentication and login
	app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

	// handle the callback after facebook has authenticated the user
	app.get('/auth/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect : '/mailbox',
			failureRedirect : '/login'
		}));

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

		// pool.connect(function (err) {
		//   if (err) return console.log(err);

		// 	  // execute a query on our database
		// 	  pool.query('SELECT * FROM post,users where post.iduser = users.id ORDER BY idpost DESC OFFSET 0 LIMIT 2', function (err, result) {
		// 	    if (err) {
		// 	    	res.end();
		// 	    	return console.log(err);
		// 	    }
		// 	    // disconnect the client
		// 	    res.render('index.ejs',{
		// 			user : req.user,
		// 			list : result ,
		// 			nav: 1
		// 		}); 
		// 	});

			
		// });

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
