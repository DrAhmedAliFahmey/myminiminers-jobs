const express = require("express");
const app = express();
const http = require("http");
const {getHttpPort} = require("../conifg");
const {log, colors} = require("./logs");

const HTTP_PORT = getHttpPort();

exports.app = app;

exports.initServer = function initServer() {
	return new Promise(resolve => {
		const server = http.createServer(app).listen(HTTP_PORT, () => {
			resolve(server);
			log(colors.brightGreen(`************ Crypto gnomes jobs is running on port ${HTTP_PORT} ************`));
		});
	});
};

