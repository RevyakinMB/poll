var mongoose = require('mongoose'),
	db;

//TODO: move connection string to app config.json
mongoose.connect('mongodb://localhost/studentsTesting');

db = mongoose.connection;

db.on('error', function(err) {
	// TODO: smarter application logging (winston, etc)
	console.log('connection error:', err.message);
});

db.once('open', function() {
	console.log('Connected to DB');
});

module.exports = db;
