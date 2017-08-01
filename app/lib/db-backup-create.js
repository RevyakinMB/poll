let execute = require('../lib/promise-executer'),
	spawn = require('child_process').spawn,

	mkdirProcess = function(dumpPath) {
		return new Promise(function(resolve, reject) {
			let mkdirArgs = ['-p', dumpPath],
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
			let dumpArgs = ['--db', 'studentsTesting', '--out', dumpPath],
				mongodump = spawn('mongodump', dumpArgs);

			mongodump.stdout.on('data', function(data) {
				console.log(data.toString('utf8'));
			});

			mongodump.stderr.on('data', function(data) {
				console.log('stderr:', data.toString('utf8'));
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
		let now = new Date(),
			dumpPath = [
				// TODO: move dump path to config
				'dump/testing-',
				now.getFullYear(),
				'-',
				numExpand(now.getMonth()+1),
				'-',
				numExpand(now.getDate()),
				'.',
				numExpand(now.getHours()),
				'.',
				numExpand(now.getMinutes()),
				'.',
				numExpand(now.getSeconds())
			].join('');

		console.log('Creating new dump at:', dumpPath);

		return new Promise(function(resolve, reject) {
			execute(function*() {
				try {
					yield mkdirProcess(dumpPath);
					yield dumpProcess(dumpPath);

					resolve();
				} catch (err) {
					console.log(err);
					reject(err);
				}
			}());
		});
	};

module.exports = dbBackup;
