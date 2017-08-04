const http = require('http'),

	HttpError = function(status, message) {
		Error.call(this, arguments);
		Error.captureStackTrace(this, HttpError);

		this.status = status;
		this.message = message || http.STATUS_CODES[status] || 'Error';
	};

HttpError.prototype = Object.create(Error.prototype);
HttpError.prototype.constructor = HttpError;

module.exports.HttpError = HttpError;
