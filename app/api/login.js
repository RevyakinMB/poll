const AuthError = require('../db/model/users-schema').AuthError,
	HttpError = require('../error').HttpError,
	User = require('../db/model/users-schema').UsersModel;

module.exports = function(app) {
	app.post('/api/login', function(req, res, next) {
		User.authorize(req.body.login, req.body.password)
			.then((user) => {
				req.session.user = user.login;
				res.send(user);
			})
			.catch((err) => {
				if (err instanceof AuthError) {
					return next(new HttpError(401));
				}
				return next(err);
			});
	});

	app.post('/api/logout', function(req, res, next) {
		req.session.destroy((err) => {
			if (err) {
				return next(err);
			}
			return res.send({});
		});
	});
};
