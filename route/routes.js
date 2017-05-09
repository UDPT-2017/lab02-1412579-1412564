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
	var moment = require('moment');
	var fs = require('fs');
	var dateFormat = require('dateformat');
	var slug = require('slug');

	var momentNow = moment();
	var formatted = momentNow.format('YYYY-MM-DD HH:mm:ss');

	app.get('/', function(req, res) {
		
		console.log(formatted);
		res.render('index'); // load the index.ejs file
	});

	app.get('/mailbox', isLoggedIn, function(req, res) {
		pool.connect(function (err) {
		  if (err) return console.log(err);
			  // execute a query on our database
			pool.query('select mailbox.id, title, content, read, created_at, read_time, fullname from mailbox,users where user_receive = '+ req.user.id +'and users.id = mailbox.user_send order by mailbox.id desc', function (err, result) {
			    if (err) {
			    	res.end();
			    	return console.log(err);
			    }
			    pool.query('select count(*) from mailbox where user_receive = ' + req.user.id + ' and read = 0 group by user_receive', function (err, count) {
				    if (err) {
				    	res.end();
				    	return console.log(err);
				    }
				    pool.query('select count(*) from mailbox where user_receive = ' + req.user.id + ' group by user_receive', function (err, countAll) {
					    if (err) {
					    	res.end();
					    	return console.log(err);
					    }
					    // disconnect the client
					    pool.query('select * from friend, users where user_id = '+ req.user.id +' and friend_id = id', function (err, friend) {
						    if (err) {
						    	res.end();
						    	return console.log(err);
						    }
						    // disconnect the client
						    // console.log(result.rows);
						    // console.log(countAll.rows);
						    // console.log(countAll.rows.length);
						    var countMailAll = 0;
						    if(countAll.rows.length > 0)
						    	countMailAll = countAll.rows[0].count;
						    var countMailRe = 0;
						    if(count.rows.length > 0)
						    	countMailRe = count.rows[0].count;
						    res.render('mailbox',{
								received : result.rows,
								friend: friend.rows,
								countMailAll: countMailAll,
								countMailRe: countMailRe,
								sentEmail: req.flash('sentEmail')[0]
							}); 
						});
					});
				});
			});

			
		});
	});

	app.get('/sentbox', isLoggedIn, function(req, res) {
		pool.connect(function (err) {
		  if (err) return console.log(err);
			  // execute a query on our database
			  pool.query('select mailbox.id, title, content, read, created_at, read_time, fullname from mailbox,users where user_send = '+ + req.user.id +'and users.id = mailbox.user_receive order by mailbox.id desc', function (err, result) {
			    if (err) {
			    	res.end();
			    	return console.log(err);
			    }
			    pool.query('select count(*) from mailbox where user_send = ' + req.user.id + ' group by user_send', function (err, count) {
				    if (err) {
				    	res.end();
				    	return console.log(err);
				    }
				    // disconnect the client
				    pool.query('select count(*) from mailbox where user_receive = ' + req.user.id + 'and read = 0 group by user_receive', function (err, countRe) {
					    if (err) {
					    	res.end();
					    	return console.log(err);
					    }
					    // disconnect the client
					    pool.query('select * from friend, users where user_id = '+ req.user.id +' and friend_id = id', function (err, friend) {
						    if (err) {
						    	res.end();
						    	return console.log(err);
						    }
						    // disconnect the client
						    // console.log(result.rows);
						    // console.log(count.rows);
						    var countMail = 0;
						    if(count.rows.length > 0)
						    	countMail = count.rows[0].count;
						    var countMailRe = 0;
						    if(countRe.rows.length > 0)
						    	countMailRe = countRe.rows[0].count;
						    res.render('sentbox',{
								sent : result.rows,
								count: countMail,
								countMailRe: countMailRe,
								friend: friend.rows,
								sentEmail: req.flash('sentEmail')[0],
							}); 
						});
					});
				});
			});

			
		});
	});

	app.get('/compose', isLoggedIn, function(req, res) {
		pool.connect(function (err) {
		  if (err) return console.log(err);
			  // execute a query on our database
			pool.query('select * from friend,users where user_id = '+ + req.user.id +' and friend_id = users.id', function (err, result) {
			    if (err) {
			    	res.end();
			    	return console.log(err);
			    }
			    // disconnect the client
			    pool.query('select count(*) from mailbox where user_receive = ' + req.user.id + 'and read = 0 group by user_receive', function (err, count) {
				    if (err) {
				    	res.end();
				    	return console.log(err);
				    }
			    // disconnect the client
				    pool.query('select * from friend, users where user_id = '+ req.user.id +' and friend_id = id', function (err, friend) {
				    if (err) {
				    	res.end();
				    	return console.log(err);
				    }
				    // disconnect the client
					    //console.log(result.rows);
					    var countMailRe = 0;
						    if(count.rows.length > 0)
						    	countMailRe = count.rows[0].count;
					    res.render('compose',{
							friend_list : result.rows,
							countMailRe: countMailRe,
							friend: friend.rows,
						}); 
					});
				});
			});

			
		});
	});

	app.post('/compose', isLoggedIn, function(req, res) {
		// console.log(req.body.receive_id);
		// console.log(req.body.sbjName);
		// console.log(req.body.content);
		pool.connect(function (err) {
		  if (err) return console.log(err);
			  // execute a query on our database
			var insertQuery = "insert into mailbox(title,user_send,user_receive,content,read,created_at,read_time) values('" + 
			        req.body.sbjName  +"','"+ 
			        req.user.id +"','"+ 
			        req.body.receive_id +"','"+ 
			        req.body.content +"',"+ 
			        0 +",'"+ 
			        formatted +
			        "',null)";
			pool.query(insertQuery, function (err, result) {
				if (err) {
					res.end();
					return console.log(err);
				}
				// disconnect the client
				req.flash('sentEmail', 'Oke fine! I am Done');
				res.redirect('/mailbox');
			});

			
		});
	});

	app.get('/read/:id', isLoggedIn, function(req, res) {
		pool.connect(function (err) {
		  if (err) return console.log(err);
			  // execute a query on our database
			pool.query('select * from mailbox,users where user_send = users.id and mailbox.id = '+ req.params.id, function (err, result) {
			    if (err) {
			    	res.end();
			    	return console.log(err);
			    }
			    // disconnect the client
			    pool.query('select count(*) from mailbox where user_receive = ' + req.user.id + 'and read = 0 group by user_receive', function (err, count) {
				    if (err) {
				    	res.end();
				    	return console.log(err);
				    }
			    // disconnect the client
				    pool.query('select * from friend, users where user_id = '+ req.user.id +' and friend_id = id', function (err, friend) {
				    if (err) {
				    	res.end();
				    	return console.log(err);
				    }
				    // disconnect the client
					    pool.query("update mailbox set read = 1, read_time = '"+ formatted + "' where id = " + req.params.id, function (err, update) {
					    if (err) {
					    	res.end();
					    	return console.log(err);
					    }
					    // disconnect the client
						    //console.log(result.rows);
						    var countMailRe = 0;
							    if(count.rows.length > 0)
							    	countMailRe = count.rows[0].count;
						    res.render('reademail',{
								email : result.rows[0],
								countMailRe: countMailRe,
								friend: friend.rows,
							}); 
						});
					});
				});
			});

			
		});
	});


	app.get('/readsent/:id', isLoggedIn, function(req, res) {
		pool.connect(function (err) {
		  if (err) return console.log(err);
			  // execute a query on our database
			pool.query('select * from mailbox,users where user_receive = users.id and mailbox.id = '+ req.params.id, function (err, result) {
			    if (err) {
			    	res.end();
			    	return console.log(err);
			    }
			    // disconnect the client
			    pool.query('select count(*) from mailbox where user_receive = ' + req.user.id + 'and read = 0 group by user_receive', function (err, count) {
				    if (err) {
				    	res.end();
				    	return console.log(err);
				    }
			    // disconnect the client
				    pool.query('select * from friend, users where user_id = '+ req.user.id +' and friend_id = id', function (err, friend) {
					    if (err) {
					    	res.end();
					    	return console.log(err);
					    }
					    // disconnect the client
						   
						    // disconnect the client
							    //console.log(result.rows);
					    var countMailRe = 0;
						    if(count.rows.length > 0)
						    	countMailRe = count.rows[0].count;
					    res.render('readsent',{
							email : result.rows[0],
							countMailRe: countMailRe,
							friend: friend.rows,
						}); 
						
					});
				});
			});

			
		});
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

function checkUserId(req, res, next) {

	// if user isnt authenticated in the session, carry on
	if (req.user && req.user.id == req.params.id)
		return next();

	// if they are redirect them to the home page
	res.redirect('back');
}
