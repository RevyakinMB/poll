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
			execute(function*() {
				try {
					let dbRequest, doc;
					if (!req.params.id) {
						doc = yield Model.find().exec();
						return res.send(doc);
					}

					dbRequest = Model.findOne({ _id: req.params.id });
					if (populateDocument) {
						dbRequest.populate(populateDocument);
					}
					doc = yield dbRequest.exec();

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

app.post('/api/question-sets/:id?', function(req, res) {
	var weightsDataShapeAndQueriesGet = function() {
		var weightInsertDocuments = [],
			queries = [];
		req.body.questions.forEach(function(question) {
			question.answers.forEach(function(answer) {
				var idWeight;
				if (answer._id) {
					// weight document is in database already, update it
					queries.push(
						AnswerWeightsModel.findByIdAndUpdate(
							answer.idWeight._id,
							{
								weight: answer.idWeight.weight
							},
							{}
						).exec());
					// replace populated field before db update
					answer.idWeight = answer.idWeight._id;
					return;
				}
				// answer weight document is not in database
				answer._id = mongoose.Types.ObjectId();
				idWeight = mongoose.Types.ObjectId();

				weightInsertDocuments.push({
					_id: idWeight,
					idAnswer: answer._id,
					weight: answer.idWeight.weight
				});
				answer.idWeight = idWeight;
			});
		});
		if (weightInsertDocuments.length) {
			queries.push(AnswerWeightsModel.insertMany(weightInsertDocuments));
		}
		return queries;
	};

	execute(function* pGen() {
		try {
			let doc;
			if (req.params.id) {
				doc = yield QuestionSetsModel.findById(req.params.id).exec();
				if (!doc) {
					console.log('Warning: document', req.params.id, 'not found');
				}
			}

			yield Promise.all(weightsDataShapeAndQueriesGet());

			if (!doc) {
				res.statusCode = 201;
				doc = new QuestionSetsModel();
			}
			doc.name = req.body.name;
			doc.questions = req.body.questions;

			doc = yield doc.save();
			doc = yield AnswerWeightsModel.populate(doc, 'questions.answers.idWeight');
			return res.send(doc);
		} catch (err) {
			return documentSaveErrorHandler(err, res);
		}
	}());
});

app.post('/api/groups/:id?', function(req, res) {
	execute(function* pGen() {
		try {
			let doc;
			if (req.param.id) {
				doc = yield GroupsModel.findById(req.params.id).exec();
				if (!doc) {
					console.log('Warning: document', req.params.id, 'not found');
				}
			} else {
				res.statusCode = 201;
				doc = new GroupsModel();
			}
			doc.groupName = req.body.groupName;
			doc.students = req.body.students;

			doc = yield doc.save();
			return res.send(doc);
		} catch (err) {
			return documentSaveErrorHandler(err, res);
		}
	}());
});

app.all('/*', function(req, res) {
	res.sendFile('index.html', {
		root: path.join(__dirname, 'public')
	});
});

app.listen(8080, function()  {
	console.log('Server is listening on port 8080');
});


