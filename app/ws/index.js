const wsServerCreate = function(sessionParser) {
	const WebSocket = require('ws'),
		config = require('../config'),
		authCheck = require('../middleware/authCheck'),
		wss = new WebSocket.Server({ port: config.get('wsPort') });
	let clients = [],
		messageSend;

	wss.on('connection', function(ws, req) {
		sessionParser(req, {}, function() {
			if (!req.session.user) {
				ws.close(1008, 'Unauthorized');
				return;
			}
			clients.push(ws);

			ws.on('message', function(msg) {
				console.log('incoming message:', msg);
			});

			ws.on('close', function() {
				console.log('WS client disconnected');
				clients = clients.filter(ws => ws.readyState !== ws.CLOSED);
			});
		});
	});

	messageSend = function(msg) {
		clients.forEach(c => c.send(JSON.stringify(msg)));
	};

	return {
		webSocketServerInstance: function() {
			return wss;
		},
		messageSend: messageSend
	};
};

module.exports = wsServerCreate;
