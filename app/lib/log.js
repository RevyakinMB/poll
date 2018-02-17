const winston = require('winston'),
	morgan = require('morgan'),
	fs = require('fs'),
	path = require('path'),
	logsDir = path.join(__dirname, '..', '..', 'logs'),
	config = require('../config');

let logger, timestampFn, numExpand;

if (!fs.existsSync(logsDir)) {
	fs.mkdirSync(logsDir);
}

numExpand = function(number) {
	return (number / 10 < 1 ? '0' : '') + number;
};

timestampFn = function() {
	const d = new Date();
	return d.getFullYear() + '-' +
		numExpand(d.getMonth() + 1) + '-' +
		numExpand(d.getDate()) + ' ' +
		numExpand(d.getHours()) + ':' +
		numExpand(d.getMinutes()) + ':' +
		numExpand(d.getSeconds());
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
			filename: path.join(logsDir, config.get('logFilename')),
			timestamp: timestampFn
		})
	]
});

module.exports = logger;
