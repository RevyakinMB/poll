let spawn = require('child_process').spawn,
	glob = require('glob'),

	execute = require('../lib/promise-executer'),

	serverErrorHandler = function(err, res) {
		res.statusCode = 500;
		return res.send({ error: 'Server error' });
	},

	restore,
	dump,
	dumpMkdir,
	dumpProcess,
	expandNumber,

	backupRoutingProvide = function(app) {
		app.get('/api/backups', function(req, res) {
			glob('dump/testing-*', function(err, dirs) {
				let args, du, backups = [];
				if (err) {
					return serverErrorHandler(err, res);
				}
				args = ['-sh'].concat(dirs);
				du = spawn('du', args);

				du.stdout.on('data', function (data) {
					data.toString('utf8').split('\n').forEach(
						function(b) {
							if (!b) {
								return;
							}
							b = b.split(/\s+/);
							backups.push({
								size: b[0],
								date: b[1].substr(b[1].indexOf('-') + 1)
							});
						}
					);
				});

				du.stderr.on('data', function (data) {
					console.error('stderr: ' + data);
				});

				du.on('exit', function (code) {
					if (code) {
						return serverErrorHandler(
							new Error('`du` exit code: ' + code), res);
					}
					res.send(backups);
				});
			});
		});

		app.post('/api/backups', function(req, res) {
			if (req.body.date !== undefined) {
				restore(req, res);
				return;
			}
			dump(req, res);
		});
	};

restore = function(req, res) {
	let args = ['dump/testing-' + req.body.date],
		mongorestore = spawn('mongorestore', args);

	console.log('Restoring', args[0], 'dump...');

	mongorestore.stdout.on('data', function(data) {
		console.log(data.toString('utf8'));
	});

	mongorestore.stderr.on('data', function(data) {
		console.error('stderr:', data.toString('utf8'));
	});

	mongorestore.on('exit', function(code) {
		if (code) {
			return serverErrorHandler(
				new Error('`mongorestore` exit code: ' + code, res)
			);
		}

		res.send({ 'status': 'OK' });
	});
};

dump = function(req, res) {
	let now = new Date(),
		dumpPath = [
			'dump/testing-',
			now.getFullYear(),
			'-',
			expandNumber(now.getMonth()+1),
			'-',
			expandNumber(now.getDate()),
			'.',
			expandNumber(now.getHours()),
			'.',
			expandNumber(now.getMinutes()),
			'.',
			expandNumber(now.getSeconds())
		].join('');

	console.log('Creating new dump at:', dumpPath + '...');

	execute(function* () {
		try {
			yield dumpMkdir(dumpPath);
			yield dumpProcess(dumpPath);

			res.send({ 'status': 'OK' });
		} catch (err) {
			return serverErrorHandler(err, res);
		}
	}());
};

dumpMkdir = function(dumpPath) {
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
};

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
};

expandNumber = function(number) {
	return (number / 10 < 1 ? '0' : '') + number;
};

module.exports = backupRoutingProvide;
