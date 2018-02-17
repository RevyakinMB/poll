var mongoose = require('mongoose'),
	log = require('../lib/log'),
	config = require('../config'),
	db;

mongoose.Promise = global.Promise;
mongoose.connect(config.get('mongoConnection'));

db = mongoose.connection;

db.on('error', function(err) {
	log.error('connection error:', err.message);
});

db.once('open', function() {
	log.debug('Connected to DB');
});

module.exports = db;
