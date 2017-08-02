#!/usr/bin/env node

'use strict';

var express = require('express'),
	app = express(),
	logger = require('morgan'),
	bodyParser = require('body-parser'),
	path = require('path');

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

app.listen(8080, function()  {
	// TODO: port to app config
	console.log('Server is listening on port 8080');
});


