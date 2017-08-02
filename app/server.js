#!/usr/bin/env node

'use strict';

var express = require('express'),
	app = express(),
	logger = require('morgan'),
	bodyParser = require('body-parser'),
	path = require('path'),

	HttpError = require('./error').HttpError;

require('./db/db-connect');

app.use(bodyParser.json());

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

	if (err instanceof HttpError) {
		res.statusCode = err.status;
		res.send({
			error: err.message
		});
		return;
	}

	if (app.get('env') === 'development') {
		express.errorHandler()(err, req, res, next);
		return;
	}

	res.statusCode = 500;
	res.send({
		error: 'Internal server error'
	});
});

app.listen(8080, function()  {
	// TODO: port to app config
	console.log('Server is listening on port 8080');
});


