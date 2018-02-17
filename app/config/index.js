var nconf = require('nconf'),
	fs = require('fs'),
	path = require('path');

if (!fs.existsSync(path.join(__dirname, 'config.json'))) {
	throw new Error('config.json not found in ' + __dirname);
}

nconf.argv()
	.env()
	.file({ file: path.join(__dirname, 'config.json') });

module.exports = nconf;
