angular
	.module('utils')
	.factory('websocket', function() {
		/**
		 * Creates web socket, controls its state,
		 * provides api to send data,
		 * and reconnect to server
		 *
		 * @param config.host {String} Host to connect to
		 * @param config.port {Number} Port to connect to
		 * @param config.reconnect {Boolean} Try to reconnect to server
		 * on disconnection
		 * @param config.onMessage {Function} Function to provide new message
		 * from server into
		 * @param config.onOpen {Function} Function to invoke
		 * on socket (re)connection
		 * @param config.onDisconnect {Function} Function to invoke
		 * on socket disconnection
		 */
		return function(config) {
			var reconnectDelay = 2,
				reconnectTimer,
				socket,
				socketCreate;
			socketCreate = function() {
				var connectionString;
				if (!config.host) {
					throw new Error('No host provided');
				}
				connectionString = 'ws://' + config.host;
				if (config.port) {
					connectionString += ':' + config.port;
				}
				socket = new WebSocket(connectionString);
				socket.onmessage = function(message) {
					if (config.onMessage) {
						config.onMessage(message.data);
					}
				};
				socket.onopen = function() {
					clearTimeout(reconnectTimer);
					reconnectDelay = 1;
					if (config.onOpen) {
						config.onOpen();
					}
				};
				socket.onclose = function(event) {
					var onDisconnect = config.onDisconnect || function noop() {};
					onDisconnect(event.code, event.reason, reconnectDelay);
					if (!config.reconnect) {
						return;
					}
					if (event.code === 1008 && event.reason === 'Unauthorized') {
						// no reconnect if user is unauthorized
						return;
					}
					reconnectTimer = setTimeout(socketCreate, reconnectDelay * 1000);
					reconnectDelay += 2;
				};
			};
			socketCreate();
			return {
				send: function(message) {
					if (!socket.readyState === socket.CLOSED) {
						throw new Error('Connection is closed');
					}
					socket.send(message);
				},
				forceConnect: function() {
					if (!socket.readyState === socket.OPEN) {
						socket.close();
					} else {
						clearTimeout(reconnectTimer);
					}
					socketCreate();
				}
			};
		};
	});
