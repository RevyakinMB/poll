module.exports = function(app) {
	let spawn = require('child_process').spawn,
		glob = require('glob'),

		dbBackup = require('../lib/db-backup-create'),

		serverErrorHandler = function(err, res) {
			res.statusCode = 500;
			return res.send({ error: 'Server error' });
		},

		dbRestore = function(req, res) {
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
			dbRestore(req, res);
			return;
		}
		dbBackup().then(
			function() {
				res.send({ 'status': 'OK' });
			},
			function(err) {
				console.log(err);
				serverErrorHandler(err, res);
			}
		);
	});
};
