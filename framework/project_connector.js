const fs = require("fs");
const path = require("path");
const util = require("util");
const readDirPromise = util.promisify(fs.readdir);
const statPromise = util.promisify(fs.stat);
const {app} = require("./app");


exports.connectModules = async function connectModules() {
	const basePath = path.resolve("./modules");
	await walk(basePath, basePath.replace(/\\/g, "/"), fileHandler);
};

function getRoutePath(file, basePath) {
	return file.replace(/\\/g, "/")
		.replace(basePath, "")
		.replace("api.js", "");

}

function attachRoute(file, basePath) {
	if (file.includes("api.js")) {
		const route = require(file);
		app.use(getRoutePath(file, basePath).replace("_", "-"), route);
	}
}

function loadPassportStrategies(file) {
	if (file.includes("passport_strategies")) {
		require(file);
	}
}

function loadWS(file) {
	if (file.includes(".api_ws.js")) {
		require(file);
	}
}

function loadJobs(file) {
	if (file.includes(".job.js")) {
		require(file);
	}
}

function fileHandler(file, basePath) {
	attachRoute(file, basePath);
	loadPassportStrategies(file);
	loadWS(file);
	loadJobs(file);
}


async function walk(dir, basePath, fileHandler) {
	const list = await readDirPromise(dir);
	let pending = list.length;
	if (!pending) {
		return;
	}
	for (const i in list) {
		const file = path.resolve(dir, list[i]);
		const stat = await statPromise(file);
		if (stat && stat.isDirectory()) {
			await walk(file, basePath, fileHandler);
		} else {
			fileHandler(file, basePath);
		}
		pending--;
	}
}

exports.walk = walk;
