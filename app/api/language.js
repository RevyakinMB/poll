module.exports = function(app) {
	app.get('/api/_language', function(req, res) {
		res.send({
			language: req.headers['accept-language']
		});
	});
};
