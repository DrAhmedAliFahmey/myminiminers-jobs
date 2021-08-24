const WebSocket = require("ws");
const {app} = require("../framework/app");
const routes = {};


function noop() {
}

function heartbeat() {
	this.isAlive = true;
}

function setSocketEvents(socket) {

	socket.on("message", socketMessageEvent);
	socket.on("close", socketCloseEvent);
	socket.on("pong", heartbeat);


}

function socketCloseEvent() {

}

function socketConnectionEvent(socket, req) {

	socket.isAlive = true;
	socket.user = req.session.user;
	setSocketEvents(socket);
}

function socketMessageEvent(message) {
	try {
		message = JSON.parse(message);
		routes[message.url](this, message.data);
	} catch (e) {
		console.error(e);
	}
}

function initPingPong(wsServer) {
	return setInterval(function ping() {
		wsServer.clients.forEach(function each(socket) {
			if (socket.isAlive === false) {
				return socket.terminate();
			}
			socket.isAlive = false;
			socket.ping(noop);
		});
	}, 30000);
}

function serverCloseEvent(interval) {
	clearInterval(interval);
}

exports.initWSServer = function initServer(server) {
	const wsServer = new WebSocket.Server({
		server,
		verifyClient: (info, done) => {
			app.sessionParser(info.req, {}, () => {
				done(info.req.session.passport.user);
			});
		}
	});
	const pingPongInterval = initPingPong(wsServer);
	wsServer.on("connection", socketConnectionEvent);
	wsServer.on("close", serverCloseEvent.bind(this, pingPongInterval));
	return wsServer;
};

exports.addRoute = function (url, fun) {
	routes[url] = fun;
};
