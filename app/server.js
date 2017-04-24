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
	AnswerWeightsModel = require('./db/answer-weights-schema'),

	//Promise = require('promise'),

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
	//console.error(err.stack);
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

[{
	path: '/api/groups/:id?',
	model: GroupsModel
}, {
	path: '/api/question-sets/:id?',
	model: QuestionSetsModel,
	populate: 'questions.answers.idWeight'
}]
	.forEach(function(p) {
		var path = p.path,
			Model = p.model,
			populateDocument = p.populate;

		app.get(path, function(req, res) {
			var dbRequest;
			if (!req.params.id) {
				return Model.find(function(err, data) {
					if (err) {
						return serverErrorHandler(err, res);
					}
					return res.send(data);
				});
			}

			dbRequest = Model.findOne({
				_id: req.params.id
			});

			// TODO: authorization required
			if (populateDocument) {
				dbRequest.populate(populateDocument);
			}
			return dbRequest.exec(function (err, data) {
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
	var weightsInsert = function(req) {
		var weightDocuments = [];
		req.body.questions.forEach(function(question) {
			question.answers.forEach(function(answer) {
				var idWeight;
				if (answer._id) {
					// replace populated field before db update
					answer.idWeight = answer.idWeight._id;
					return;
				}
				// answer weight document is not in database
				answer._id = mongoose.Types.ObjectId();
				idWeight = mongoose.Types.ObjectId();

				weightDocuments.push({
					_id: idWeight,
					idAnswer: answer._id,
					weight: answer.idWeight.weight
				});
				answer.idWeight = idWeight;
			});
		});
		if (weightDocuments.length) {
			return AnswerWeightsModel.insertMany(weightDocuments);
		}
		return Promise.resolve();
	},
	createOrUpdate = function(document) {
		weightsInsert(req)
			.then(function() {
				if (document) {
					document.name = req.body.name;
					document.questions = req.body.questions;
					return document;
				}
				res.statusCode = 201;
				return new QuestionSetsModel({
					name: req.body.name,
					questions: req.body.questions
				});
			})
			.then(function(doc) {
				return doc.save();
			})
			.then(function(doc) {
				return AnswerWeightsModel.populate(doc, 'questions.answers.idWeight');
			})
			.then(function(doc) {
				return res.send(doc);
			})
			.catch(function(err) {
				return documentSaveErrorHandler(err, res);
			});
	};

	if (!req.params.id) {
		createOrUpdate();
		return;
	}

	var weightUpdateQueries = [];
	req.body.questions.forEach(function(question) {
		question.answers.forEach(function(answer) {
			if (!answer.idWeight._id) {
				return;
			}
			// weight document is in database already, update it
			weightUpdateQueries.push(
				AnswerWeightsModel.findByIdAndUpdate(
					answer.idWeight._id,
					{
						weight: answer.idWeight.weight
					},
					{}
				).exec());
		});
	});

	Promise.all(weightUpdateQueries)
		.catch(function(err) {
			console.log('Error occurred while answer',
				answer.text, answer._id,
				'update:',
				err.message);
		})
		.then(function() {
			return QuestionSetsModel.findById(req.params.id).exec();
		})
		.then(function(document) {
			if (!document) {
				console.log('Warning: document', req.params.id, 'not found');
			}
			createOrUpdate(document);
		})
		.catch(function(err) {
			return serverErrorHandler(err, res);
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


