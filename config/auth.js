// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

	'facebookAuth' : {
		'clientID'        : '310019682781511',
        'clientSecret'    : '5406f26498d9c2cdb251e3dfa5c7b7c0',
        'callbackURL'     : 'http://localhost:3000/auth/facebook/callback',
        // 'profileFields'   : ['id', 'emails', 'name','profileUrl','photos'] 
	},

	'twitterAuth' : {
		'consumerKey' 		: 'your-consumer-key-here',
		'consumerSecret' 	: 'your-client-secret-here',
		'callbackURL' 		: 'http://localhost:8080/auth/twitter/callback'
	},

	'googleAuth' : {
		'clientID' 		: 'your-secret-clientID-here',
		'clientSecret' 	: 'your-client-secret-here',
		'callbackURL' 	: 'http://localhost:8080/auth/google/callback'
	}
};