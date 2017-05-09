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

const pool = require('./model/pg');

require('./config/passport')(passport,pool);

var hbs = exphbs.create({ defaultLayout: 'main' });
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');// set up ejs for templating

app.use(express.static('public'));
//set up application
app.use(morgan('dev')); // log every request to the console -> need to debug
app.use(cookieParser()); // read cookie => for auth
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());


// required for passport
app.use(session({
	secret: 'tangliang',
	resave: true,
	saveUninitialized: true
 } )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // session flash message

app.use(function(req,res,next){
	res.locals = ({
		user: req.user
	});
	return next();
});

// routes ======================================================================
require('./route/routes.js')(app, passport,pool); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('Server started on port ' + port);
