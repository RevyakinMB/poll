const spawn = require('child_process').spawn,
	glob = require('glob'),

	dbBackup = require('../lib/db-backup-create'),
	authCheck = require('../middleware/authCheck'),
	log = require('../lib/log');

module.exports = function(app) {
	const dbRestore = function(req, res, next) {
		const args = ['dump/testing-' + req.body.date],
			mongorestore = spawn('mongorestore', args);

		log.debug('Restoring', args[0], 'dump...');

		mongorestore.stdout.on('data', function(data) {
			log.debug(data.toString('utf8'));
		});

		mongorestore.stderr.on('data', function(data) {
			log.error('stderr:', data.toString('utf8'));
		});

		mongorestore.on('exit', function(code) {
			if (code) {
				log.error('`mongorestore` exit code: ' + code);
				next(500);
				return;
			}

			res.send({ status: 'OK' });
		});
	};

	app.get('/api/backups', authCheck, function(req, res, next) {
		glob('dump/testing-*', function(err, dirs) {
			let args, du, backups = [];
			if (err) {
				next(err);
				return;
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
				log.error('stderr: ' + data);
			});

			du.on('exit', function (code) {
				if (code) {
					log.error('`du` exit code: ' + code);
					next(500);
					return;
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
				res.send({ status: 'OK' });
			},
			function(err) {
				next(err);
			}
		);
	});
};
