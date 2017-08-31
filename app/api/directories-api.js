const EduFormsModel = require('../db/model/directory-schema').EduFormsModel,
	SpecialtiesModel = require('../db/model/directory-schema').SpecialtiesModel,

	authCheck = require('../middleware/authCheck');

module.exports = function(app) {
	[{
		path: '/api/edu-forms/:id?',
		model: EduFormsModel
	}, {
		path: '/api/specialties/:id?',
		model: SpecialtiesModel
	}].forEach((opt) => {
		app.get(opt.path, authCheck, function(req, res, next) {
			opt.model.find().exec().then(
				ls => res.send(ls),
				err => next(err)
			);
		});

		app.post(opt.path, authCheck, function(req, res, next) {
			const promise = Promise.resolve();
			if (req.query.action === 'delete') {
				next();
				return;
			}

			if (req.params.id) {
				promise.then(
					() => opt.model
						.findById(req.params.id)
						.exec()
						.catch(err => next(err))
				);
			}
			promise
				.then((doc) => {
					if (!doc) {
						res.statusCode = 201;
						doc = new opt.model();
					}
					doc.name = req.body.name;
					return doc.save();
				})
				.then(doc => res.send(doc))
				.catch(err => next(err));
		});

		app.post(opt.path, function(req, res, next) {
			opt.model
				.remove({
					_id: req.params.id
				})
				.exec()
				.then(() => res.send())
				.catch(err => next(err));
		});
	});
};

