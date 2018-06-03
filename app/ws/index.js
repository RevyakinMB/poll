const wsServerCreate = function(sessionParser) {
	const WebSocket = require('ws'),
		config = require('../config'),
		authCheck = require('../middleware/authCheck'),
		wss = new WebSocket.Server({ port: config.get('wsPort') });

	wss.on('connection', function(ws, req) {
		sessionParser(req, {}, function() {
			if (!req.session.user) {
				ws.close(1008, 'Unauthorized');
				return;
			}
			ws.on('message', function(msg) {
				console.log('incoming message:', msg);
			});

			ws.on('close', function() {
				console.log('DISCONNECTED');
			});

			ws.send('Hello from WebSocket server');
		});
	});

	return wss;
};

module.exports = wsServerCreate;
