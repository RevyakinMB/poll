#!/usr/bin/env node

let execute = require('../lib/promise-executer'),
	mongoose = require('mongoose'),
	dbBackup = require('../lib/db-backup-create'),

	connectionOpen = function() {
		return new Promise(function(resolve, reject) {
			mongoose.connection.on('open', resolve);
			mongoose.connection.on('error', reject);
		});
	},

	databaseDrop = function() {
		return new Promise(function(resolve, reject) {
			mongoose.connection.dropDatabase(err => {
				if (err) {
					reject(err);
					return;
				}
				resolve();
			});
		});
	},

	modelsRequire = function() {
		require('./users-schema');
		require('./factor-sets-schema');

		return Promise.all(
			Object.keys(mongoose.models).map(model => {
				return mongoose.models[model].ensureIndexes();
			})
		);
	},

	userCreate = function() {
		let Users = require('./users-schema'),
			user = new Users({
				login: 'Admin',
				password: 'admin'
			});

		return user.save();
	},

	factorSetCreate = function() {
		// TODO: Cattell factor set JSON data
	};

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/studentsTesting');

execute(function* () {
	try {
		yield connectionOpen();
		//yield dbBackup();
		yield databaseDrop();
		yield modelsRequire();
		yield userCreate();

		//yield factorSetCreate();

	} catch (err) {
		if (err) {
			console.error(err);
		}
	}
	mongoose.connection.close();
}());
