// server.js

// setup 
var express  = require('express');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');

var app      = express();
var port     = process.env.PORT || 3000;

var passport = require('passport');
var flash    = require('connect-flash');


const pool = require('./model/pg');

require('./config/passport')(passport,pool);


app.use(express.static('public'));
//set up application
app.use(morgan('dev')); // log every request to the console -> need to debug
app.use(cookieParser()); // read cookie => for auth
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
	secret: 'tangliang',
	resave: true,
	saveUninitialized: true
 } )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // session flash message



// routes ======================================================================
require('./route/routes.js')(app, passport,pool); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('Server started on port ' + port);
