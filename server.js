var express = require('express');
var app = express();
var bodyParser = require('body-parser');
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


// =================
// routes 
// =================
app.get('/', function(req, res){
	res.send('Hello!  The API is at http://localhost:' +port+ '/api');
});

// =================
// API Routes
// =================





// =================
// start the server
// =================
app.listen(port);
console.log('Magic happens at http://localhost:' +port);