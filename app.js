// server.js

// setup 
// setup 
var express  = require('express');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var exphbs = require('express-handlebars')


var app      = express();
var port     = process.env.PORT || 3000;

var passport = require('passport');
var flash    = require('connect-flash');

const pool = require('./app/model/pg');

require('./config/passport')(passport,pool);

var hbs = exphbs.create({ defaultLayout: 'main' ,
	helpers: {
		inc : function(value, options)
			{
			    return parseInt(value) + 1;
			}
	}
});

require('./config/express')(app,hbs,express, session,morgan,cookieParser,bodyParser,passport,flash);


// routes ======================================================================
require('./route/routes.js')(app, passport,pool); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('Server started on port ' + port);
