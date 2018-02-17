var mongoose = require('mongoose'),
	log = require('../lib/log'),
	db;

mongoose.Promise = global.Promise;
// TODO: move connection string to app config.json
mongoose.connect('mongodb://localhost/studentsTesting');

db = mongoose.connection;

db.on('error', function(err) {
	log.error('connection error:', err.message);
});

db.once('open', function() {
	log.debug('Connected to DB');
});

module.exports = db;
