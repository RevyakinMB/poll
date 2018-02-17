const morgan = require('morgan'),
	log = require('./log');

module.exports = function(app) {
	app.use(morgan('tiny', {
		stream: {
			write: function(message) {
				log.debug(message.trim());
			}
		}
	}));
};
