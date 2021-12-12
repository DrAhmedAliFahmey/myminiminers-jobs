const {TIME_IN_MILI} = require("./framework/times");
exports.getHttpPort = function getHttpPort() {
	return process.env.PORT || 3003;
};

exports.getMongoDbUrl = function getMongoDbUrl() {
	return process.env.MONGODB_URL || `mongodb://user:secret@localhost:27017/${this.getMongoDbName()}?authSource=admin`;
};

exports.getMongoDbName = function getMongoDbName() {
	return process.env.MONGODB_NAME || "crypto_gnomes";
};

exports.getMongoDbOptions = function getMongoDbOptions() {
	return {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		poolSize: this.getNodeEnv() === "development" ? 2 : 10,
	};
};

exports.getRedisConnection = function getRedisConnection() {
	if (process.env.REDIS_CONNECTION) {
		return process.env.REDIS_CONNECTION;
	}
	return {};
};

exports.getSessionSecret = function getSessionSecret() {
	return process.env.SESSION_SECRET || "fdsfsdklfq09wfjklasjdf09w2fjklsdjf093wflksjdfweghoisdv093jfklsjf09w4gujskdf9";
};

exports.getRedisDbName = function getRedisDbName() {
	return process.env.REDIS_NAME || "main_redis";
};

exports.getNodeEnv = function getNodeEnv() {
	return process.env.NODE_ENV ? process.env.NODE_ENV : process.env.NODE_ENV = "production";
};

exports.getJoiOptions = function getJoiOptions() {
	return {
		abortEarly: false
	};
};

exports.getEncryptionSecret = function getEncryptionSecret() {
	return process.env.ENCRYPTION_SECRET || "vndfkjnvidfjvdfjb89dafjbkdajfb0adf9ubadkjnbfdafjbkadfjdfads";
};

exports.getBycryptSecret = function getBycryptSecret() {
	return process.env.BYCRYPT_SECRET || "asdq132fyakjsfh89qewqfascec8ce3t8jasdasdq32fj9auhviuavh3i4jng";
};


exports.cors = function () {
	const corsOptions = {
		origin: [],
		optionsSuccessStatus: 200,
		credentials: true,

	};
	if (process.env.NODE_ENV === "development") {
		corsOptions.origin.push("http://localhost:3001");
		corsOptions.origin.push("http://localhost:3000");
	}
	return corsOptions;
};

exports.cookieSessionOptions = function () {
	const options = {
		secure: true,
		httpOnly: true,
		sameSite: "none",
		maxAge: TIME_IN_MILI.DAY
	};
	if (process.env.NODE_ENV === "development") {
		options.secure = false;
		delete options.sameSite;
	}
	return options;
};
