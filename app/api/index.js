module.exports = function(app) {
	let GroupsModel = require('../db/model/groups-schema'),
		TestingsModel = require('../db/model/testings-schema'),
		QuestionSetsModel = require('../db/model/question-sets-schema'),
		FactorSetsModel = require('../db/model/factor-sets-schema'),

		crypto = require('crypto'),

		execute = require('../lib/promise-executer'),

		serverErrorHandler,
		documentUpdateErrorHandler,
		testPassingProcess;


	serverErrorHandler = function(err, res) {
		// TODO: enhance logging
		console.log('Error:', err);
		res.statusCode = 500;
		return res.send({ error: 'Server error' });
	};

	documentUpdateErrorHandler = function(err, res) {
		console.log('Error:', err);
		if (err.name === 'ValidationError') {
			res.statusCode = 400;
			return res.send({
				error: 'Validation error'
			});

		} else if (err.message === 'SessionChanged') {
			res.statusCode = 400;
			return res.send({
				error: 'Session changed error'
			});

		} else if (err.message === 'SessionExists') {
			res.statusCode = 400;
			return res.send({
				error: 'Session exists error'
			});

		} else if (err.message === 'TestPassedAlready') {
			res.statusCode = 400;
			return res.send({
				error: 'Test passed already error'
			});

		} else {
			res.statusCode = 500;
			return res.send({
				error: 'Server error'
			});
		}
	};

	require('./db-backup-api')(app);

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
						searchBy[options.searchParam || '_id'] = req.params[param];

						if (req.query.action === 'delete') {
							if (Model === GroupsModel) {
								let docs = yield TestingsModel.find({
									idGroup: req.params[param]
								}).exec();

								if (docs.length > 0) {
									res.statusCode = 400;
									return res.send({
										error: 'A testing with specified group exists'
									});
								}
							}
							yield Model.remove(searchBy).exec();
							return res.send();
						}

						if (req.params[param]) {
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
						return documentUpdateErrorHandler(err, res);
					}
				}());
			});

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

	testPassingProcess = function(doc, query) {
		let attempt, attempts;
		if (!query.idStudent) {
			// not a test passing, just testing creation/update
			return;
		}
		attempts = doc.attempts.filter(function(a) {
			return a.idStudent.toString() === query.idStudent;
		});

		if (attempts.length === 0) {
			// create attempt for a new student
			doc.attempts.push({
				idStudent: query.idStudent,
				startedAt: new Date(),
				results: [],
				session: crypto.randomBytes(16).toString('hex')
			});
			return;
		}

		attempt = attempts[0];
		if (!attempt.session) {
			console.error('Error: empty student session in db');
			throw new Error('server error');
		}

		if (attempt.session === query.session) {
			attempt.results.push({
				idQuestion: query.idQuestion,
				answers: query.answers
			});

			if (attempt.results.length === doc.idQuestionSet.questions.length) {
				attempt.finishedAt = new Date();
			}

		} else if (!query.session && !query.restartConfirmed) {
			throw new Error('SessionExists');

		} else if (!query.session && query.restartConfirmed) {
			if (attempt.results.length === doc.idQuestionSet.questions.length) {
				throw new Error('TestPassedAlready');

			} else {
				attempt.session = crypto.randomBytes(16).toString('hex');
			}

		} else if (query.session !== attempt.session) {
			throw new Error('SessionChanged');
		}
	};

	// testing queries
	app.post('/api/testings/:id?', function(req, res) {
		execute(function*() {
			try {
				let doc;

				if (req.query.action === 'delete') {
					yield TestingsModel.remove({
						_id: req.params.id
					}).exec();
					return res.send();
				}

				if (req.params.id) {
					let q = TestingsModel.findById(req.params.id);
					if (req.query.idStudent) {
						// testing is in progress
						q = q.populate('idQuestionSet');
					}
					doc = yield q.exec();
					if (!doc) {
						console.log('Warning: document', req.params.id, 'not found');
					}
				}

				if (!doc) {
					res.statusCode = 201;
					doc = new TestingsModel();
				}

				testPassingProcess(doc, req.query);

				['idQuestionSet', 'idGroup', 'scheduledFor']
					.forEach(field => doc[field] = req.body[field]);

				doc = yield doc.save();
				return res.send(doc);
			} catch (err) {
				return documentUpdateErrorHandler(err, res);
			}
		}());
	});

	app.get('/api/testings/:id?', function(req, res) {
		execute(function*() {
			try {
				let doc;

				if (!req.params['id']) {
					doc = yield TestingsModel.find().exec();
					return res.send(doc);
				}

				doc = yield TestingsModel
					.findById(req.params['id'])
					.populate('idQuestionSet idGroup')
					.exec();

				if (!doc) {
					res.statusCode = 404;
					return res.send({ error: 'Not found' });
				}

				// TODO: check authorization?
				if (!req.query.weightsLoad) {
					// replace correct answer information
					doc.idQuestionSet.questions.forEach(q => {
						q.answers.forEach(a => {
							a.weight = -1;
						});
					});
				}

				return res.send(doc);
			} catch(err) {
				return serverErrorHandler(err, res);
			}
		}());
	});

	app.all('/api/*', function(req, res) {
		res.statusCode = 404;
		return res.send({ error: 'Not found' });
	});
};