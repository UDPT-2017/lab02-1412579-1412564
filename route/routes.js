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
	const nodemailer = require('nodemailer');
	var slug = require('slug');



	let transporter = nodemailer.createTransport({
	    service: 'gmail',
	    auth: {
	        user: 'iuemanhngatxiu@gmail.com',
	        pass: '1345314bommy'
	    }
	});

	app.get('/', function(req, res) {
		res.render('index');
	});

	app.get('/mailbox', function(req, res) {
		res.render('index');
	});

	//show login form
	app.get('/login', Logged, function(req, res) {
		res.render('login', { message: req.flash('loginMessage') });
	});

	// post login
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/mailbõx', // redirect to homepage if user logged
            failureRedirect : '/login', // redirect back to the loggin page if fail
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            //console.log("hello");
            //remember me
            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/'); //redirect to Home
    });

    app.get('/signup', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('signup', { message: req.flash('signupMessage') });
	});

	// post signup
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/login', // redirect to login if success,  auto login and back to home
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/mailbox',
            failureRedirect : '/login'
        }));


	// Log out
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
