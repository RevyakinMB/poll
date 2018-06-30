const TestingsModel = require('../db/model/testings-schema'),
	DeletedAttemptsModel = require('../db/model/deleted-testing-attempts-schema'),

	crypto = require('crypto'),

	execute = require('../lib/promise-executer'),
	HttpError = require('../error').HttpError,
	authCheck = require('../middleware/authCheck'),
	log = require('../lib/log');

module.exports = function(app, ws) {
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
			log.error('Error: empty student session in db');
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
			next();
			return;
		}
		execute(function* () {
			try {
				let doc, currentStudentAttempt;

				if (req.params.id) {
					let q = TestingsModel.findById(req.params.id);
					if (req.query.idStudent) {
						// testing is in progress
						q = q.populate('idQuestionSet');
					}
					doc = yield q.exec();
					if (!doc) {
						log.warn('Warning: document', req.params.id, 'not found');
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

				currentStudentAttempt = doc.attempts
					.filter(a => a.idStudent.toString() === req.query.idStudent);
				if (currentStudentAttempt.length) {
					currentStudentAttempt = currentStudentAttempt[0];
					ws.messageSend({
						idStudent: req.query.idStudent,
						nextQuestionNumber: currentStudentAttempt.results.length
					});
				}

				res.send(doc);
			} catch (err) {
				next(err);
			}
		}());
	});

	// delete a whole testing
	app.post('/api/testings/:id', function(req, res, next) {
		if (req.query.idStudent) {
			next();
			return;
		}
		TestingsModel
			.findById(req.params.id)
			.exec()
			.then((t) => {
				if (t && t.attempts.length) {
					throw new HttpError(400, 'Testing started already');
				}
				return TestingsModel.remove({ _id: req.params.id }).exec();
			})
			.then(() => res.send())
			.catch(err => next(err));
	});

	// delete (replace to separate document) just a testing attempt
	app.post('/api/testings/:id', function(req, res, next) {
		let testing;
		Promise.all([
			TestingsModel.findById(req.params.id).exec(),
			DeletedAttemptsModel.find({
				idStudent: req.query.idStudent
			}).exec()
		]).then(([t, deletedAttempts]) => {
			let doc, found = false;
			if (!t) {
				throw new HttpError(404, 'Testing not found');
			}
			testing = t;
			doc = deletedAttempts.length ?
				deletedAttempts[0] :
				new DeletedAttemptsModel({
					idTesting: req.params.id,
					attempts: []
				});
			for (let i = 0; i < t.attempts.length; ++i) {
				let a = t.attempts[i];
				if (a.idStudent.toString() === req.query.idStudent) {
					doc.attempts.push(a);
					t.attempts.splice(i, 1);
					found = true;
					break;
				}
			}
			if (!found) {
				throw new HttpError(404, 'Attempt not found');
			}
			return doc.save();
		})
			.then(() => testing.save())
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

				doc = yield testingFindById(req.params.id);
				if (!doc) {
					next(new HttpError(404));
					return;
				}

				if (!req.query.weightsLoad) {
					// replace correct answer information
					doc.idQuestionSet.questions.forEach((q) => {
						q.answers.forEach((a) => {
							a.weight = -1;
						});
					});
				}

				res.send(doc);
			} catch (err) {
				next(err);
			}
		}());
	});
};
