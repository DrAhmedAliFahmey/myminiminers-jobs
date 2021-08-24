const winston = require("winston");

const customFormat = winston.format.printf(({ level, message, timestamp }) => `${timestamp} [${level}] ${message}`);

// instantiate a new Winston Logger with the settings defined above
const logger = winston.createLogger({
	transports: [
		new winston.transports.Console({
			level: (process.env.NODE_ENV === "development" || !process.env.NODE_ENV)
				? "debug" : "info",
		}),
	],
	exitOnError: false, // do not exit on handled exceptions
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.simple(),
		customFormat,
	),
});

module.exports = logger;
