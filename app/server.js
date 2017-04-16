'use strict';

var express = require('express'),
	app = express(),
	logger = require('morgan'),
	bodyParser = require('body-parser'),

	path = require('path'),
	GroupsModel = require('./db/groups-schema'),
	TestingsModel = require('./db/testings-schema'),
	QuestionSetsModel = require('./db/question-sets-schema'),

	serverErrorHandler,
	documentSaveErrorHandler;
require('./db/db-connect');

app.use(bodyParser.json());

// log requests to console
app.use(logger('combined'));

app.use(express.static(path.join(__dirname, 'public')));

serverErrorHandler = function(err, res) {
	res.statusCode = 500;
	// TODO: enhance logging
	console.error('Internal server error:', err.message);
	return res.send({ error: 'Server error' });
};

documentSaveErrorHandler = function(err, res) {
	console.log('Error:', err.message);
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

[{
	path: '/api/groups/:id?',
	model: GroupsModel
}, {
	path: '/api/question-sets/:id?',
	model: QuestionSetsModel
}]
	.forEach(function(p) {
		var path = p.path,
			Model = p.model;

		app.get(path, function(req, res) {
			console.log();
			if (!req.params.id) {
				return Model.find(function(err, data) {
					if (err) {
						return serverErrorHandler(err, res);
					}
					return res.send(data);
				});
			}
			return Model.findOne({
				_id: req.params.id
			}, function (err, data) {
				if (err) {
					return serverErrorHandler(err, res);
				}
				if (!data) {
					res.statusCode = 404;
					return res.send({ error: 'Not found' });
				}
				return res.send(data);
			});
		});
});

app.post('/api/question-sets/:id?', function(req, res) {
	var createOrUpdate = function(document) {
		if (!document) {
			res.statusCode = 201;
			document = new QuestionSetsModel({
				name: req.body.name,
				questions: req.body.questions
			});
		}
		document.save(function(err) {
			if (!err) {
				// TODO: execute another request to save answers' weights
				return res.send(document);
			}
			return documentSaveErrorHandler(err, res);
		});
	};

	if (!req.params.id) {
		createOrUpdate();
		return;
	}

	QuestionSetsModel.findById(req.params.id, function(err, document) {
		if (err) {
			return serverErrorHandler(err, res);
		}
		if (!document) {
			console.log('Warning: document', req.params.id, 'not found');
		} else {
			document.name = req.body.name;
			document.questions = req.body.questions;
		}
		createOrUpdate(document);
	});
});

app.post('/api/groups/:id?', function(req, res) {
	var createOrUpdate = function(document) {
		if (!document) {
			res.statusCode = 201;
			document = new GroupsModel({
				groupName: req.body.groupName,
				students: req.body.students
			});
		}
		document.save(function(err) {
			if (err) {
				return documentSaveErrorHandler(err, res);
			}
			return res.send(document);
		});
	};

	if (!req.params.id) {
		// create new document
		createOrUpdate();
		return;
	}
	GroupsModel.findById(req.params.id, function(err, document) {
		if (err) {
			return serverErrorHandler(err, res);
		}
		if (!document) {
			console.log('Warning: document', req.params.id, 'not found');
		} else {
			document.groupName = req.body.groupName;
			document.students = req.body.students;
		}
		createOrUpdate(document);
	});
});

app.all('/*', function(req, res) {
	res.sendFile('index.html', {
		root: path.join(__dirname, 'public')
	});
});

app.listen(8080, function()  {
	console.log('Server is listening on port 8080');
});


