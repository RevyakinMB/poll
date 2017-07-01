angular
	.module('utils')
	.factory('messenger', function messengerFactory($timeout) {
		return function messenger(options, message) {
			if (message.messageDelay) {
				$timeout.cancel(message.messageDelay);
			}

			if (!options) {
				message.hidden = true;
				return;
			}

			message.text = options.message;
			message.hidden = false;
			message.error = options.isError;

			message.messageDelay = $timeout(function() {
				message.hidden = true;
			}, options.isError ? 15000 : 3000);
		};
	});
