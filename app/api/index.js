module.exports = function(app) {
	let GroupsModel = require('../db/model/groups-schema'),
		TestingsModel = require('../db/model/testings-schema'),
		QuestionSetsModel = require('../db/model/question-sets-schema'),
		FactorSetsModel = require('../db/model/factor-sets-schema'),

		crypto = require('crypto'),

		execute = require('../lib/promise-executer'),
		HttpError = require('../error').HttpError,

		testPassingProcess;

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

			app.post(path, function(req, res, next) {
				if (req.query.action === 'delete') {
					next();
					return;
				}
				execute(function* pGen() {
					try {
						let doc, searchBy = {};
						searchBy[options.searchParam || '_id'] = req.params[param];

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
						next(err);
					}
				}());
			});

			app.post(path, function(req, res, next) {
				if (Model === GroupsModel) {
					TestingsModel.find({
						idGroup: req.params[param]
					}).exec()
						.then(function(docs) {
							if (docs.length > 0) {
								next(new HttpError(400, 'A testing with specified group exists'));
							} else {
								next();
							}
						})
						.catch(err => next(err));
				} else {
					next();
				}
			});

			app.post(path, function(req, res, next) {
				let searchBy = {};
				searchBy[options.searchParam || '_id'] = req.params[param];

				Model.remove(searchBy).exec()
					.then(() => res.send())
					.catch(err => next(err));
			});

			app.get(path, function(req, res, next) {
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
						next(err);
					}
				}());
			});
		});

	testPassingProcess = function(doc, query, next) {
		let attempt, attempts;
		if (!query.idStudent) {
			// not a test passing, just testing creation/update
			return false;
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
			return false;
		}

		attempt = attempts[0];
		if (!attempt.session) {
			console.error('Error: empty student session in db');
			next(500);
			return true;
		}

		if (attempt.session === query.session) {
			attempt.results.push({
				idQuestion: query.idQuestion,
				answers: query.answers
			});

			if (attempt.results.length === doc.idQuestionSet.questions.length) {
				attempt.finishedAt = new Date();
			}
			return false;

		} else if (attempt.finishedAt) {
			next(new HttpError(400, 'Test passed already error'));

		} else if (!query.session && !query.restartConfirmed) {
			next(new HttpError(400, 'Session exists error'));

		} else if (!query.session && query.restartConfirmed) {
			attempt.session = crypto.randomBytes(16).toString('hex');
			return false;

		} else if (query.session !== attempt.session) {
			next(new HttpError(400, 'Session changed error'));
		}
		return true;
	};

	// testing queries
	app.post('/api/testings/:id?', function(req, res, next) {
		if (req.query.action === 'delete') {
			next('route');
			return;
		}
		execute(function*() {
			try {
				let doc;

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

				if (testPassingProcess(doc, req.query, next)) {
					return;
				}

				['idQuestionSet', 'idGroup', 'scheduledFor']
					.forEach(field => doc[field] = req.body[field]);

				doc = yield doc.save();
				return res.send(doc);
			} catch (err) {
				next(err);
			}
		}());
	});

	app.post('/api/testings/:id', function(req, res, next) {
		TestingsModel.remove({
			_id: req.params.id
		}).exec()
			.then(() => res.send())
			.catch(err => next(500));
	});

	app.get('/api/testings/:id?', function(req, res, next) {
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
				next(err);
			}
		}());
	});

	app.all('/api/*', function(req, res) {
		res.statusCode = 404;
		return res.send({ error: 'Not found' });
	});
};
