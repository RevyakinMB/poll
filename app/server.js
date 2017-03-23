'use strict';

var express = require('express'),
	app = express(),
	logger = require('morgan'),

	path = require('path');

// log requests to console
app.use(logger('combined'));

app.use(express.static(path.join(__dirname, 'public')));
app.all('/*', function(req, res) {
	res.sendfile('index.html', {
		root: path.join(__dirname, 'public')
	});
});

app.listen(8080, function()  {
	console.log('Server is listening on port 8080');
});


