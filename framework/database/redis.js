const redis = require("redis");
const asyncRedis = require("async-redis");
const {hasKey} = require("../utils/types/object");

const config = require("../../conifg");
const connections = {};
const DEFAULT_NAME = config.getRedisDbName();
const DEFAULT_CONNECTION_OPTIONS = config.getRedisConnection();

exports.DEFAULT_REDIS_DBS = {
	SESSION: 1
};

function setConnectionName(name) {
	if (!hasKey(connections, name)) {
		connections[name] = {dbs: {}, pubsub: null};
	}
}

function getPubSubConnectionHolder(name) {
	return connections[name].pubsub;
}

function addPubSubConnection(name, client) {
	if (!connections[name].pubsub) {
		connections[name].pubsub = client;
	}
}

function addDbConnection(name, db, client) {
	if (!connections[name].dbs[db]) {
		connections[name].dbs[db] = client;
	}
}

function getDbConnectionHolder(name, options, db) {
	options.db = options.db || db;
	return connections[name].dbs[options.db];
}

function promisifyClient(client, promisify) {
	if (promisify) {
		asyncRedis.decorate(client);
	}
}

async function closeDbConnection(name, db) {
	const client = this.getDb(db, name);
	if (client) {
		return client.close();
	}
}

async function closePubSubConnection(name) {
	const client = this.getPubSub(name);
	if (client) {
		client.close();
	}
}

exports.connect = function connect({name = DEFAULT_NAME, options = DEFAULT_CONNECTION_OPTIONS, db, pubsub = false, promisify = true}) {
	return new Promise((resolve, reject) => {
		setConnectionName(name);
		const connectionHolder = pubsub ? getPubSubConnectionHolder(name) : getDbConnectionHolder(name, options, db);
		if (connectionHolder) {
			return connectionHolder;
		}
		const client = redis.createClient(options);
		pubsub ? addPubSubConnection(name, client) : addDbConnection(name, db, client);
		promisifyClient(client, promisify);
		client.on("ready", () => {
			resolve(client);
		});
		client.on("error", err => {
			reject(err);
		});
	});


};
exports.getPubSub = function getPubSub(name = DEFAULT_NAME) {
	if (!hasKey(connections, name, "pubsub")) {
		throw new Error("no pubsub open connection");
	}
	return connections[name].pubsub;
};

exports.getDb = function getDb(db, name = DEFAULT_NAME) {
	if (!hasKey(connections, name, "dbs", db)) {
		throw new Error("no redis open connection");
	}
	return connections[name].dbs[db];
};

exports.close = function close(name, db) {
	if (name) {
		return db ? closeDbConnection(name, db) : closePubSubConnection(name);
	}
	const allConnectionsPromise = [];
	Object.keys(connections).forEach(name => {
		Object.keys(connections.dbs).forEach(db => allConnectionsPromise.push(close(name, db).catch(console.error)));
		allConnectionsPromise.push(close(name).catch(console.error));
		delete connections[name];
	});
	return Promise.all(allConnectionsPromise);
};


