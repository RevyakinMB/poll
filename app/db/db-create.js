#!/usr/bin/env node

const execute = require('../lib/promise-executer'),
	mongoose = require('mongoose'),
	dbBackup = require('../lib/db-backup-create'),
	log = require('../lib/log'),
	config = require('./config'),

	connectionOpen = function() {
		return new Promise(function(resolve, reject) {
			mongoose.connection.on('open', resolve);
			mongoose.connection.on('error', reject);
		});
	},

	databaseDrop = function() {
		return new Promise(function(resolve, reject) {
			mongoose.connection.dropDatabase((err) => {
				if (err) {
					reject(err);
					return;
				}
				resolve();
			});
		});
	},

	modelsRequire = function() {
		require('./model/users-schema');
		require('./model/factor-sets-schema');

		return Promise.all(
			Object.keys(mongoose.models).map(
				model => mongoose.models[model].ensureIndexes()
			)
		);
	},

	userCreate = function() {
		const Users = require('./model/users-schema').UsersModel,
			user = new Users({
				login: 'Admin',
				password: 'admin'
			});

		return user.save();
	},

	factorSetCreate = function() {
		mongoose.connection.collection('factorsets').insertOne(
			{ name: 'Cattell', factors: [{ _id: '596cde1feb8c762a9063c3f0', index: 'A', nameNegative: 'A-', namePositive: 'A+', matches: [{ rawSum: 4, sten: '1' }, { sten: '2', rawSum: 5 }, { rawSum: 6, sten: '3' }, { rawSum: null, sten: '4' }, { rawSum: 7, sten: '5' }, { rawSum: 8, sten: '6' }, { rawSum: 9, sten: '7' }, { rawSum: 10, sten: '8' }, { rawSum: 11, sten: '9' }, { rawSum: 12, sten: '10' }] }, { _id: '596cde35eb8c762a9063c3fb', index: 'B', nameNegative: 'B-', namePositive: 'B+', matches: [{ rawSum: 2, sten: '1' }, { rawSum: null, sten: '2' }, { rawSum: 3, sten: '3' }, { rawSum: null, sten: '4' }, { rawSum: 4, sten: '5' }, { sten: '6' }, { rawSum: 5, sten: '7' }, { rawSum: null, sten: '8' }, { rawSum: 6, sten: '9' }, { rawSum: 8, sten: '10' }] }, { _id: '596cde51eb8c762a9063c406', index: 'C', nameNegative: 'C-', namePositive: 'C+', matches: [{ sten: '1', rawSum: 3 }, { sten: '2', rawSum: 4 }, { sten: '3', rawSum: 5 }, { sten: '4', rawSum: 6 }, { sten: '5', rawSum: 7 }, { sten: '6', rawSum: 8 }, { sten: '7', rawSum: 9 }, { sten: '8', rawSum: 10 }, { sten: '9', rawSum: 11 }, { sten: '10', rawSum: 12 }] }, { _id: '596cdeb2eb8c762a9063c41c', index: 'E', nameNegative: 'E-', namePositive: 'E+', matches: [{ sten: '1', rawSum: 1 }, { sten: '2', rawSum: 2 }, { sten: '3', rawSum: 3 }, { sten: '4', rawSum: 4 }, { sten: '5', rawSum: 5 }, { sten: '6', rawSum: 6 }, { sten: '7', rawSum: 7 }, { sten: '8', rawSum: 8 }, { sten: '9', rawSum: 9 }, { sten: '10', rawSum: 12 }] }, { _id: '596cdeb2eb8c762a9063c411', index: 'F', nameNegative: 'F-', namePositive: 'F+', matches: [{ sten: '1', rawSum: 2 }, { sten: '2', rawSum: null }, { sten: '3', rawSum: 3 }, { sten: '4', rawSum: 4 }, { sten: '5', rawSum: 5 }, { sten: '6', rawSum: 6 }, { sten: '7', rawSum: 7 }, { sten: '8', rawSum: null }, { sten: '9', rawSum: 8 }, { sten: '10', rawSum: 12 }] }, { _id: '596cdeb2eb8c762a9063c427', index: 'G', nameNegative: 'G-', namePositive: 'G+', matches: [{ sten: '1', rawSum: 3 }, { sten: '2', rawSum: 4 }, { sten: '3', rawSum: 5 }, { sten: '4', rawSum: 6 }, { sten: '5', rawSum: 7 }, { sten: '6', rawSum: 8 }, { sten: '7', rawSum: 9 }, { sten: '8', rawSum: 10 }, { sten: '9', rawSum: 11 }, { sten: '10', rawSum: 12 }] }, { _id: '596cdee5eb8c762a9063c432', index: 'H', nameNegative: 'H-', namePositive: 'H+', matches: [{ sten: '1', rawSum: 3 }, { sten: '2', rawSum: 4 }, { sten: '3', rawSum: 5 }, { sten: '4', rawSum: 6 }, { sten: '5', rawSum: 7 }, { sten: '6', rawSum: 8 }, { sten: '7', rawSum: 9 }, { sten: '8', rawSum: 10 }, { sten: '9', rawSum: 11 }, { sten: '10', rawSum: 12 }] }, { _id: '596cdf52eb8c762a9063c43d', index: 'I', nameNegative: 'I-', namePositive: 'I+', matches: [{ sten: '1', rawSum: 3 }, { sten: '2', rawSum: 4 }, { sten: '3', rawSum: 5 }, { sten: '4', rawSum: 6 }, { sten: '5', rawSum: 7 }, { sten: '6', rawSum: 8 }, { sten: '7', rawSum: 9 }, { sten: '8', rawSum: 10 }, { sten: '9', rawSum: 11 }, { sten: '10', rawSum: 12 }] }, { _id: '596ce0a3eb8c762a9063c45e', index: 'L', nameNegative: 'L-', namePositive: 'L+', matches: [{ sten: '1', rawSum: 1 }, { sten: '2', rawSum: 2 }, { sten: '3', rawSum: null }, { sten: '4', rawSum: 3 }, { sten: '5', rawSum: 4 }, { sten: '6', rawSum: null }, { sten: '7', rawSum: 5 }, { sten: '8', rawSum: 6 }, { sten: '9', rawSum: 7 }, { sten: '10', rawSum: 12 }] }, { _id: '596ce0cbeb8c762a9063c469', index: 'M', nameNegative: 'M-', namePositive: 'M+', matches: [{ sten: '1', rawSum: 3 }, { sten: '2', rawSum: null }, { sten: '3', rawSum: 4 }, { sten: '4', rawSum: 5 }, { sten: '5', rawSum: 6 }, { sten: '6', rawSum: 7 }, { sten: '7', rawSum: 8 }, { sten: '8', rawSum: 9 }, { sten: '9', rawSum: 10 }, { sten: '10', rawSum: 12 }] }, { _id: '596ce0ebeb8c762a9063c474', index: 'N', nameNegative: 'N-', namePositive: 'N+', matches: [{ sten: '1', rawSum: 1 }, { sten: '2', rawSum: 2 }, { sten: '3', rawSum: 3 }, { sten: '4', rawSum: 4 }, { sten: '5', rawSum: 5 }, { sten: '6', rawSum: 6 }, { sten: '7', rawSum: 7 }, { sten: '8', rawSum: 8 }, { sten: '9', rawSum: 9 }, { sten: '10', rawSum: 12 }] }, { _id: '596ce07ceb8c762a9063c453', index: 'O', nameNegative: 'O-', namePositive: 'O+', matches: [{ sten: '1', rawSum: 1 }, { sten: '2', rawSum: 3 }, { sten: '3', rawSum: 4 }, { sten: '4', rawSum: 5 }, { sten: '5', rawSum: 6 }, { sten: '6', rawSum: 7 }, { sten: '7', rawSum: 8 }, { sten: '8', rawSum: 9 }, { sten: '9', rawSum: 10 }, { sten: '10', rawSum: 12 }] }, { _id: '596ce11eeb8c762a9063c48a', index: 'Q1', nameNegative: 'Q1-', namePositive: 'Q1+', matches: [{ sten: '1', rawSum: 4 }, { sten: '2', rawSum: 5 }, { sten: '3', rawSum: 6 }, { sten: '4', rawSum: null }, { sten: '5', rawSum: 7 }, { sten: '6', rawSum: 8 }, { sten: '7', rawSum: 9 }, { sten: '8', rawSum: 10 }, { sten: '9', rawSum: 11 }, { sten: '10', rawSum: 12 }] }, { _id: '596ce061eb8c762a9063c448', index: 'Q2', nameNegative: 'Q2-', namePositive: 'Q2+', matches: [{ sten: '1', rawSum: 2 }, { sten: '2', rawSum: 3 }, { sten: '3', rawSum: null }, { sten: '4', rawSum: 4 }, { sten: '5', rawSum: 5 }, { sten: '6', rawSum: 6 }, { sten: '7', rawSum: 7 }, { sten: '8', rawSum: 8 }, { sten: '9', rawSum: 9 }, { sten: '10', rawSum: 12 }] }, { _id: '596ce108eb8c762a9063c47f', index: 'Q3', nameNegative: 'Q3-', namePositive: 'Q3+', matches: [{ sten: '1', rawSum: 2 }, { sten: '2', rawSum: 3 }, { sten: '3', rawSum: 4 }, { sten: '4', rawSum: 5 }, { sten: '5', rawSum: 6 }, { sten: '6', rawSum: 7 }, { sten: '7', rawSum: 8 }, { sten: '8', rawSum: 9 }, { sten: '9', rawSum: 10 }, { sten: '10', rawSum: 12 }] }, { _id: '5911f6f910f46c54ad78807d', index: 'Q4', nameNegative: 'Q4-', namePositive: 'Q4+', matches: [{ sten: '1', rawSum: 1 }, { sten: '2', rawSum: 2 }, { sten: '3', rawSum: 3 }, { sten: '4', rawSum: 4 }, { sten: '5', rawSum: 5 }, { sten: '6', rawSum: 7 }, { sten: '7', rawSum: 8 }, { sten: '8', rawSum: 9 }, { sten: '9', rawSum: 10 }, { sten: '10', rawSum: 12 }] }, { _id: '5911f6f910f46c54ad788088', index: 'MD', nameNegative: 'MD-', namePositive: 'MD+', matches: [{ sten: '1', rawSum: 2 }, { sten: '2', rawSum: 3 }, { sten: '3', rawSum: 4 }, { sten: '4', rawSum: 5 }, { sten: '5', rawSum: 6 }, { sten: '6', rawSum: 7 }, { sten: '7', rawSum: 8 }, { sten: '8', rawSum: 9 }, { sten: '9', rawSum: 10 }, { sten: '10', rawSum: 12 }] }] }
		);
	};

mongoose.Promise = global.Promise;
mongoose.connect(config.get('mongoConnection'));

execute(function* () {
	try {
		yield connectionOpen();
		yield dbBackup();
		yield databaseDrop();
		yield modelsRequire();
		yield userCreate();

		factorSetCreate();

	} catch (err) {
		if (err) {
			log.error(err);
		}
	}
	mongoose.connection.close();
}());
