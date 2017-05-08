// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var bcrypt = require('bcrypt-nodejs');
var configAuth = require('./auth');
const nodemailer = require('nodemailer');


let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'iuemanhngatxiu@gmail.com',
        pass: '1345314bommy'
    }
});


module.exports = function(passport,pool) {

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
      done(null, user);
    });

    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        profileFields   : ['id', 'emails', 'name','profileUrl','photos','phone'] //get field recall

    },

    //config facebook login
    function(token, refreshToken, profile, done) {
        process.nextTick(function() {

            // find the user in the database based on their facebook id
            pool.query("SELECT * FROM users WHERE idfacebook = '"+ profile.id+"'", function(err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user.rows.length > 0) {
                    
                    return done(null, user.rows[0]); // user found, return that user
                } else {

                    var newFacebooker = {
                        id: profile.id,
                        token: token,
                        email: profile.emails[0].value,
                        fullname: profile.name.givenName + ' ' + profile.name.familyName,
                        url: profile.profileUrl,
                        picture: profile.photos[0].value
                    };
                    console.log(newFacebooker);
                    // if there is no user found with that facebook id, create them
                    var insertQuery = "insert into users(email,password,role,email,fullname,idfacebook,token,picture,url) values(null,null,null,'" +
                    newFacebooker.email +"','"+
                    newFacebooker.fullname  +"','"+ 
                    newFacebooker.id +"','"+ 
                    newFacebooker.token +"','"+                    
                    newFacebooker.picture  + "','"+ 
                    newFacebooker.url  +
                    "')";
                    pool.query(insertQuery,function(err, rows) {
                         if (err)
                            return console.log(err);     
                       
                    });

                    return done(null, newFacebooker);
                }

            });
        });

    }));



    passport.use(
        'local-signup',
        new LocalStrategy({

            emailField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) {
            //check user input
            pool.query("SELECT * FROM user WHERE email = '" + email + "'", function(err, rows) {
                if (err) //error
                    return done(err);
                if (rows.rows.length > 0) { //if user existed
                    return done(null, false, req.flash('signupMessage', 'email is already taken.'));
                } 
                else {
                    // if there is no user with that email
                    // create the user
                    var newUser = {
                        email: email,
                        fullname: email,
                        password: bcrypt.hashSync(password, null, null)  // use the generateHash function in our user model
                    };
                    //console.log(newUser);
                    var insertQuery = "insert into users(email,password,role,email,fullname,idfacebook,token,picture,url) values('" + newUser.email +"','"+ newUser.password +"',null,null,'" + newUser.fullname + "',null,null,null,null) RETURNING id";
                    pool.query(insertQuery,function(err, rows) {
                         if (err)
                            return done(err);
                        newUser.id = rows.rows[0].id;
                        return done(null, newUser);
                    });
                }
            });
        })
    );

   
    //config local login
    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses email and password, we will override with email
            emailField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form
            pool.query("SELECT * FROM user WHERE email = '" + email + "'", function(err, rows){
                // console.log(rows.rows[0].password);
                // console.log(bcrypt.hashSync(123456, null, null));
                // console.log(rows.rows.length);
                if (err)
                    return done(err);
                if (rows.rows.length == 0) {
                    return done(null, false, req.flash('loginMessage', 'Please check your email and Password.!!!')); // req.flash is the way to set flashdata using connect-flash
                }

                // if the user is found but the password is wrong
                if (!bcrypt.compareSync(password, rows.rows[0].password))
                    return done(null, false, req.flash('loginMessage', 'Please check your email and Password.!!!')); // create the loginMessage and save it to session as flashdata

                
                // all is well, return successful user
                return done(null, rows.rows[0]);
            });
        })
    );
};
