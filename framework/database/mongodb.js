const {MongoClient, ObjectId} = require("mongodb");
const config = require("../../conifg");
const connections = {};
const DEFAULT_NAME = config.getMongoDbName();
const DEFAULT_URL = config.getMongoDbUrl();
const DEFAULT_OPTIONS = config.getMongoDbOptions();
const {hasKey} = require("../utils/types/object");

exports.ObjectId = ObjectId;

exports.connect = async function connect({name = DEFAULT_NAME, url = DEFAULT_URL, options = DEFAULT_OPTIONS}) {
	if (hasKey(connections, name)) {
		return connections[name];
	}
	const con = await MongoClient.connect(url, options);
	connections[name] = con;

	return connections[name];
};

function getDb(name = DEFAULT_NAME) {
	if (!hasKey(connections, name)) {
		throw new Error("no mongodb open connection");
	}
	return connections[name].db(name);
}

exports.getDb = getDb;

exports.getCollection = function getCollection(collectionName, dbName = DEFAULT_NAME) {

	return getDb(dbName).collection(collectionName);
};

exports.getSession = function getSession(name = DEFAULT_NAME, sessionOpt = {}) {
	return connections[name].startSession(sessionOpt);
};

exports.close = async function close(name) {
	if (name) {
		await getDb(name).close();
		delete connections[name];
	}
	const allConnectionsPromise = [];
	Object.keys(connections).forEach(key => {
		allConnectionsPromise.push(connections[key].close().then(() => delete connections[key]).catch(console.error));
	});
	return Promise.all(allConnectionsPromise);
};


