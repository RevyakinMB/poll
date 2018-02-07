module.exports = function(app) {
	require('./login')(app);
	require('./basic-api')(app);
	require('./testings-api')(app);
	require('./directories-api')(app);
	require('./db-backup-api')(app);
	require('./import')(app);

	require('./language')(app);

	app.all('/api/*', function(req, res) {
		res.statusCode = 404;
		return res.send({ error: 'Not found' });
	});
};
