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
		pool.connect(function (err) {
		  if (err) return console.log(err);

			  // execute a query on our database
			  pool.query('SELECT * FROM post,users where post.iduser = users.id ORDER BY idpost DESC OFFSET 0 LIMIT 2', function (err, result) {
			    if (err) {
			    	res.end();
			    	return console.log(err);
			    }
			    // disconnect the client
			    res.render('index.ejs',{
					user : req.user,
					list : result ,
					nav: 1
				}); 
			});

			
		});
	});

	
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
