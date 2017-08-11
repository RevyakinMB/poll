const TestingsModel = require('../db/model/testings-schema'),

	crypto = require('crypto'),

	execute = require('../lib/promise-executer'),
	HttpError = require('../error').HttpError,
	authCheck = require('../middleware/authCheck');

module.exports = function(app) {
	const testPassingProcess = function(doc, query, next) {
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
	},
	testingFindById = function(id) {
		return TestingsModel
			.findById(id)
			.populate('idQuestionSet idGroup')
			.exec();
	};

	// testing queries
	app.post('/api/testings/:id?', function(req, res, next) {
		if (req.query.action === 'delete') {
			next('route');
			return;
		}
		execute(function* () {
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
					.forEach((field) => {
						doc[field] = req.body[field];
					});

				doc = yield doc.save();
				res.send(doc);
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
			.catch(err => next(err));
	});

	app.get('/api/testings/:id?', function(req, res, next) {
		execute(function* () {
			try {
				let doc;

				if (!req.params.id) {
					let t = TestingsModel.find();
					if (req.query.populate === 'true') {
						t = t.populate('idQuestionSet idGroup');
					}
					doc = yield t.exec();
					res.send(doc);
					return;
				}

				if (req.query.weightsLoad) {
					next();
					return;
				}

				doc = yield testingFindById(req.params.id);
				if (!doc) {
					next(new HttpError(404));
					return;
				}
				// replace correct answer information
				doc.idQuestionSet.questions.forEach((q) => {
					q.answers.forEach((a) => {
						a.weight = -1;
					});
				});

				res.send(doc);
			} catch (err) {
				next(err);
			}
		}());
	});

	app.get('/api/testings/:id', authCheck, function(req, res, next) {
		execute(function* () {
			try {
				const doc = yield testingFindById(req.params.id);
				if (doc) {
					res.send(doc);
				} else {
					next(new HttpError(404));
				}
			} catch (err) {
				next(err);
			}
		}());
	});
};
