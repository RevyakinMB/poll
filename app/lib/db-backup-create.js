const execute = require('../lib/promise-executer'),
	spawn = require('child_process').spawn,
	log = require('../lib/log'),
	config = require('../config'),
	path = require('path'),

	mkdirProcess = function(dumpPath) {
		return new Promise(function(resolve, reject) {
			const mkdirArgs = ['-p', dumpPath],
				mkdir = spawn('mkdir', mkdirArgs);
			mkdir.on('exit', function(code) {
				if (code) {
					reject(new Error('`mkdir` exit code:' + code));
				}
				resolve();
			});
		});
	},

	dumpProcess = function(dumpPath) {
		return new Promise(function(resolve, reject) {
			const dumpArgs = ['--db', 'studentsTesting', '--out', dumpPath],
				mongodump = spawn('mongodump', dumpArgs);

			mongodump.stdout.on('data', function(data) {
				log.debug(data.toString('utf8'));
			});

			mongodump.stderr.on('data', function(data) {
				log.error('stderr:', data.toString('utf8'));
			});

			mongodump.on('exit', function(code) {
				if (code) {
					reject(new Error('`mongodump` exit code:' + code));
				}
				resolve();
			});
		});
	},

	numExpand = function(number) {
		return (number / 10 < 1 ? '0' : '') + number;
	},

	dbBackup = function() {
		const now = new Date(),
			dir = config.get('dumpDir') || 'dump',
			dumpPath = path.join(dir, [
				'testing-',
				now.getFullYear(),
				'-',
				numExpand(now.getMonth() + 1),
				'-',
				numExpand(now.getDate()),
				'.',
				numExpand(now.getHours()),
				'.',
				numExpand(now.getMinutes()),
				'.',
				numExpand(now.getSeconds())
			].join(''));

		log.debug('Creating new dump at:', dumpPath);

		return new Promise(function(resolve, reject) {
			execute(function* () {
				try {
					yield mkdirProcess(dumpPath);
					yield dumpProcess(dumpPath);

					resolve();
				} catch (err) {
					log.error(err);
					reject(err);
				}
			}());
		});
	};

module.exports = dbBackup;
