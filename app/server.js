'use strict';

var express = require('express'),
	app = express(),
	logger = require('morgan'),
	bodyParser = require('body-parser'),

	mongoose = require('mongoose'),
	path = require('path'),
	GroupsModel = require('./db/groups-schema'),
	TestingsModel = require('./db/testings-schema'),
	QuestionSetsModel = require('./db/question-sets-schema'),
	FactorSetsModel = require('./db/factor-sets-schema'),

	execute = require('./lib/promise-executer'),

	serverErrorHandler,
	documentSaveErrorHandler;
require('./db/db-connect');

app.use(bodyParser.json());

// log requests to console
app.use(logger('combined'));

app.use(express.static(path.join(__dirname, 'public')));

serverErrorHandler = function(err, res) {
	// TODO: enhance logging
	console.log('Error:', err);
	res.statusCode = 500;
	return res.send({ error: 'Server error' });
};

documentSaveErrorHandler = function(err, res) {
	console.log('Error:', err);
	if (err.name === 'ValidationError') {
		res.statusCode = 400;
		return res.send({
			error: 'Validation error'
		});
	} else {
		res.statusCode = 500;
		return res.send({
			error: 'Server error'
		});
	}
};

// GET
[{
	path: '/api/groups/:id?',
	model: GroupsModel
}, {
	path: '/api/question-sets/:id?',
	model: QuestionSetsModel
}, {
	path: '/api/factor-sets/:name?',
	model: FactorSetsModel,
	searchParam: 'name'
}]
	.forEach(function(options) {
		let path = options.path,
			Model = options.model,
			param = options.searchParam || 'id';

		app.get(path, function(req, res) {
			execute(function*() {
				try {
					let doc, searchBy = {};
					if (!req.params[param]) {
						doc = yield Model.find().exec();
						return res.send(doc);
					}

					searchBy[options.searchParam || '_id'] = req.params[param];
					doc = yield Model.findOne(searchBy).exec();

					if (!doc) {
						res.statusCode = 404;
						return res.send({ error: 'Not found' });
					}
					return res.send(doc);
				} catch(err) {
					return serverErrorHandler(err, res);
				}
			}());
		});
});

// POST
[{
	path: '/api/question-sets/:id?',
	model: QuestionSetsModel,
	data: ['name', 'questions']
}, {
	path: '/api/groups/:id?',
	model: GroupsModel,
	data: ['groupName', 'students']
}, {
	path: '/api/factor-sets/:name?',
	model: FactorSetsModel,
	data: ['name', 'factors'],
	searchParam: 'name'
}]
	.forEach(function(options) {
		let path = options.path,
			Model = options.model,
			data = options.data,
			param = options.searchParam || 'id';

		app.post(path, function(req, res) {
			execute(function* pGen() {
				try {
					let doc, searchBy = {};
					if (req.params[param]) {
						searchBy[options.searchParam || '_id'] = req.params[param];
						doc = yield Model.findOne(searchBy).exec();
						if (!doc) {
							console.log('Warning: document', req.params[param], 'not found');
						}
					}
					if (!doc) {
						res.statusCode = 201;
						doc = new Model();
					}
					data.forEach(field => doc[field] = req.body[field]);

					doc = yield doc.save();
					return res.send(doc);
				} catch (err) {
					return documentSaveErrorHandler(err, res);
				}
			}());
		});
	});

app.all('/api/*', function(req, res) {
	res.statusCode = 404;
	return res.send({ error: 'Not found' });
});

app.all('/*', function(req, res) {
	res.sendFile('index.html', {
		root: path.join(__dirname, 'public')
	});
});

app.listen(8080, function()  {
	console.log('Server is listening on port 8080');
});


