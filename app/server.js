#!/usr/bin/env node

'use strict';

var express = require('express'),
	app = express(),
	logger = require('morgan'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	path = require('path'),
	mongoose = require('mongoose'),

	MongoStore = require('connect-mongo')(session),

	HttpError = require('./error').HttpError;

require('./db/db-connect');

app.use(bodyParser.json());

app.use(session({
	secret: 'sEcreTT0kEn',
	key: 'sid',
	cookie: {
		path: '/',
		httpOnly: true,
		maxAge: 24 * 60 * 60 * 1000
	},
	resave: true,
	saveUninitialized: true,
	store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

// log requests to console
app.use(logger('dev'));

app.use(express.static(path.join(__dirname, 'public')));

require('./api')(app);

app.all('/*', function(req, res) {
	res.sendFile('index.html', {
		root: path.join(__dirname, 'public')
	});
});

app.use(function(err, req, res, next) {
	if (typeof err === 'number') {
		err = new HttpError(err);
	}
	console.error(err);

	if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
		err = new HttpError(400, 'Request body is invalid');
	}

	if (err instanceof HttpError) {
		res.statusCode = err.status;
		res.send({
			error: err.message
		});
		return;
	}

	res.statusCode = 500;
	res.send({
		error: 'Internal server error'
	});
});

app.listen(8080, function() {
	// TODO: port to app config
	console.log('Server is listening on port 8080');
});
