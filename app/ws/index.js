const WebSocket = require('ws'),
	config = require('../config'),

	wss = new WebSocket.Server({ port: config.get('wsPort') });

wss.on('connection', function(ws) {
	let timer;
	ws.on('message', function(msg) {
		console.log('incoming message:', msg);
	});

	ws.on('close', function() {
		console.log('disconnected');
		clearInterval(timer);
	});

	ws.send('Hello from WebSocket server');

	timer = setInterval(function() {
		ws.send('Ping from server');
	}, 5000);
});

module.exports = wss;
