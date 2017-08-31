const GroupsModel = require('../db/model/groups-schema'),
	TestingsModel = require('../db/model/testings-schema'),
	QuestionSetsModel = require('../db/model/question-sets-schema'),
	FactorSetsModel = require('../db/model/factor-sets-schema'),

	execute = require('../lib/promise-executer'),
	HttpError = require('../error').HttpError,
	authCheck = require('../middleware/authCheck');

module.exports = function(app) {
	[{
		path: '/api/question-sets/:id?',
		model: QuestionSetsModel,
		// TODO: replace data array by req.forEach or so
		data: ['name', 'questions']
	}, {
		path: '/api/groups/:id?',
		model: GroupsModel,
		data: ['groupName', 'students', 'index', 'idEduForm', 'idSpecialty']
	}, {
		path: '/api/factor-sets/:name?',
		model: FactorSetsModel,
		data: ['name', 'factors'],
		searchParam: 'name'
	}].forEach(
	function (options) {
		const path = options.path,
			Model = options.model,
			data = options.data,
			param = options.searchParam || 'id',

			postActionSequence = function* (req, res) {
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
				data.forEach((field) => {
					doc[field] = req.body[field];
				});

				doc = yield doc.save();
				return res.send(doc);
			},
			getActionSequence = function* (req, res) {
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
			};

		app.post(path, authCheck, function (req, res, next) {
			if (req.query.action === 'delete') {
				next();
				return;
			}
			execute(function* pGen() {
				try {
					yield* postActionSequence(req, res);
				} catch (err) {
					next(err);
				}
			}());
		});

		app.post(path, function (req, res, next) {
			if (Model === GroupsModel || Model === QuestionSetsModel) {
				let searchBy = {};
				if (Model === GroupsModel) {
					searchBy.idGroup = req.params[param];
				} else if (Model === QuestionSetsModel) {
					searchBy.idQuestionSet = req.params[param];
				}

				TestingsModel.find(searchBy).exec()
					.then(function (docs) {
						if (docs.length > 0) {
							let errMsg;
							if (Model === GroupsModel) {
								errMsg = 'A testing with specified group exists';
							} else if (Model === QuestionSetsModel) {
								errMsg = 'A testing with specified question set exists';
							}
							next(new HttpError(400, errMsg));
						} else {
							next();
						}
					})
					.catch(err => next(err));
			} else {
				next();
			}
		});

		app.post(path, function (req, res, next) {
			let searchBy = {};
			searchBy[options.searchParam || '_id'] = req.params[param];

			Model.remove(searchBy).exec()
				.then(() => res.send())
				.catch(err => next(err));
		});

		app.get(path, authCheck, function (req, res, next) {
			execute(function* () {
				try {
					yield* getActionSequence(req, res);
				} catch (err) {
					next(err);
				}
			}());
		});
	});
};
