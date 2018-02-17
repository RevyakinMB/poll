const winston = require('winston'),
	morgan = require('morgan'),
	fs = require('fs'),
	path = require('path'),
	logsDir = path.join(__dirname, '..', '..', 'logs');

let logger, timestampFn, dateFormat;

if (!fs.existsSync(logsDir)) {
	fs.mkdirSync(logsDir);
}

dateFormat = function(v) {
	if (v < 10) {
		v = '0' + v;
	}
	return v;
};

timestampFn = function() {
	const d = new Date();
	return d.getFullYear() + '-' +
		dateFormat(d.getMonth() + 1) + '-' +
		dateFormat(d.getDate()) + ' ' +
		dateFormat(d.getHours()) + ':' +
		dateFormat(d.getMinutes()) + ':' +
		dateFormat(d.getSeconds());
};

logger = new winston.Logger({
	transports: [
		new winston.transports.Console({
			level: 'debug',
			colorize: true,
			timestamp: timestampFn
		}),
		new winston.transports.File({
			level: 'debug',
			// TODO: move to config.js
			filename: path.join(logsDir, 'debug.log'),
			timestamp: timestampFn
		})
	]
});

module.exports = logger;
