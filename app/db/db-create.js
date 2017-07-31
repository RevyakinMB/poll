let
	execute = require('./lib/promise-executer'),
	mongoose = require('mongoose'),

	connectionOpen,
	databaseDrop,
	modelsRequire,
	userCreate,
	// TODO: remove userTest
	userTest,
	factorSetCreate;

mongoose.Promise = global.Promise;

execute(function* () {
	try {
		yield connectionOpen();
		yield databaseDrop();
		yield modelsRequire();
		yield userCreate();

		console.log(
			yield userTest()
		);

		yield factorSetCreate();

	} catch (err) {
		if (err) {
			console.error(err);
		}
		db.close();
	}
}());

connectionOpen = function() {
	return new Promise(resolve, reject => {
		db.connection.on('open', resolve);
		db.connection.on('error', reject);
	});
};

databaseDrop = function() {
	// TODO: please backup database
	//return new Promise(resolve, reject => {
	//	db.dropDatabase(err => {
	//		if (err) {
	//			reject(err);
	//			return;
	//		}
	//		resolve();
	//	});
	//});
};

modelsRequire = function() {
	require('./db/users-schema');
	require('./db/factor-sets-schema');

	return Promise.all(
		Object.keys(mongoose.models).map(model => {
			return new Promise(resolve, reject => {
				model.createIndex((err) => {
					if (err) {
						reject(err);
						return;
					}
					resolve();
				});
			});
		})
	);
};

userCreate = function() {
	let user = new Users({
		login: 'Admin',
		password: 'admin'
	});

	return user.save();
};

userTest = function() {
	return Users.find({ login: 'Admin'});
};

factorSetCreate = function() {
	// TODO: Cattell factor set JSON data
};
