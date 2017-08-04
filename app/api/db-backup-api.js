let spawn = require('child_process').spawn,
	glob = require('glob'),

	dbBackup = require('../lib/db-backup-create'),
	authCheck = require('../middleware/authCheck');

module.exports = function(app) {
	dbRestore = function(req, res, next) {
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
				console.log('`mongorestore` exit code: ' + code);
				return next(500);
			}

			res.send({ 'status': 'OK' });
		});
	};

	app.get('/api/backups', authCheck, function(req, res, next) {
		glob('dump/testing-*', function(err, dirs) {
			let args, du, backups = [];
			if (err) {
				return next(err);
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
					console.log('`du` exit code: ' + code);
					return next(500);
				}
				res.send(backups);
			});
		});
	});

	app.post('/api/backups', authCheck, function(req, res, next) {
		if (req.body.date !== undefined) {
			dbRestore(req, res, next);
			return;
		}
		dbBackup().then(
			function() {
				res.send({ 'status': 'OK' });
			},
			function(err) {
				next(err);
			}
		);
	});
};
