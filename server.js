var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');

var jwt = require('jsonwebtoken');
var config = require('./config');
var User = require('./app/models/user'); // mongoose model


// ==============
// config
// ==============
var port = process.env.PORT || 8080;
mongoose.connect(config.database);
app.set('secret', config.secret); // sets secret variable

// ==============
// middleware
// ==============
// use body parser to get info from POST and URL parameters
app.use(bodyParser.urlencoded( {extended: false} ));
app.use(bodyParser.json());

// use morgan to log requests to the console.
app.use(morgan('dev'));
// cookie Parser
app.use(cookieParser());


// =================
// routes 
// =================
app.get('/', function(req, res){
	res.send('Hello!  The API is at http://localhost:' +port+ '/api');
});
app.get('/setup', function(req,res){


// ::::::::: FOR TESTING ONLY ::::::::::::::::
		// create a sample user
		var nick = new User({
			name: 'person1',
			password: 'password',
			admin: true
		});
// ::::::::: FOR TESTING ONLY ::::::::::::::::


	nick.save(function(err){
		if(err) throw err;

		console.log('User saved successfully');
		res.json( {success: true} );
	});
});




// =================
// API Routes
// =================
// get router instance for api routes
var apiRoutes = express.Router();

// apply the routes to our application with the prefix '/api'
// ------------------------------------
app.use('/api', apiRoutes);


// route to auth user (POST http://localhost:8080/api/authenticate)
// ------------------------------------
apiRoutes.post('/authenticate', function(req, res){
	// find user
	User.findOne({name: req.body.name}, function(err, user){
		if (err) throw err;

		if (!user) {
			return res.json( {success: false, message: 'Authentication failed.  User not found!'} );
		} 
		if(user.password !== req.body.password){
			return res.json( {success: false, message: 'Authentication failed.  Wrong password!'} );
		}

		var token = jwt.sign(user, app.get('secret'), {
			expiresIn: 1440 //expires in 24hrs
		});

		res.json({
			success: true,
			message: 'Enjoy your token!',
			token: token
		});
	});
});

// route for middleware to verify token
// ------------------------------------
apiRoutes.use(function(req, res, next){
	// check header, or url parameters, or post parameters for token
	var token = req.body.token || req.query.token || req.headers['x-access-token'];

	// decode token
	if (token) {
		// verify secret and check expiration
		jwt.verify(token, app.get('secret'), function(err, decoded){
			if (err) {
				return res.json( {success: false, message: 'Failed to authenticate token!'} );
			}

			req.decoded = decoded;
			res.cookie(token, 'cookie_value').send('Token is set as cookie');
			next();
		});
	} else {
		return res.status(403).send({
			success: false,
			message: 'No token provided!'
		});
	}
});


// route to show a random message (GET http://localhost:8080/api/)
apiRoutes.get('/', function(req, res){
	res.json( {message: 'Welcome to JWT HAWT API'});
});
// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/users', function(req, res){
	User.find({}, function(err, users){
		res.json(users);
	});
});






// =================
// start the server
// =================
app.listen(port);
console.log('Magic happens at http://localhost:' +port);