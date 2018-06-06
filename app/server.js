#!/usr/bin/env node

'use strict';

const express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	path = require('path'),
	mongoose = require('mongoose'),

	MongoStore = require('connect-mongo')(session),

	HttpError = require('./error').HttpError,
	log = require('./lib/log'),
	config = require('./config'),

	DAY = 24 * 60 * 60 * 1000;

let server, sessionParser, ws;
require('./lib/http-log')(app);
require('./db/db-connect');

app.use(bodyParser.json());

sessionParser = session({
	secret: config.get('cookieSecret'),
	key: 'sid',
	cookie: {
		path: '/',
		httpOnly: true,
		maxAge: DAY
	},
	resave: true,
	saveUninitialized: true,
	store: new MongoStore({ mongooseConnection: mongoose.connection })
});
app.use(sessionParser);

ws = require('./ws')(sessionParser);

app.use(express.static(path.join(__dirname, 'public')));

require('./api')(app, ws);

app.all('/*', function(req, res) {
	res.sendFile('index.html', {
		root: path.join(__dirname, 'public')
	});
});

app.use(function(err, req, res, next) {
	if (typeof err === 'number') {
		err = new HttpError(err);
	}
	log.error(err);

	if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
		err = new HttpError(400, 'Request body is invalid');
	}

	else if (err.name === 'MongoError' &&
		err.message.indexOf('duplicate key error') !== -1
	) {
		err = new HttpError(400, 'Duplicate key error');
	}

	else if (err.name === 'ValidationError') {
		err = new HttpError(400, err.message);
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

server = app.listen(config.get('port'), function() {
	log.debug('Server is listening on port ' + config.get('port'));
});

process.on('SIGINT', function() {
	const timer = setTimeout(function() {
		log.debug('No response from server, exiting immediately');
		process.exit();
	}, 4000);
	// TODO: locate a reason of server exit hangup
	timer.unref();

	log.debug('Kill signal received, shutting down...');

	Promise.all([
		new Promise(resolve => ws.webSocketServerInstance().close(resolve)),
		new Promise(resolve => server.close(resolve))
	]).then(() => {
		log.debug('Done');
		process.exit();
	});
});
