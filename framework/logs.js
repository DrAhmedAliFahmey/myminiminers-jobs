const morgan = require("morgan");
const morganJson = require("morgan-json");
const colors = require("colors/safe");
exports.morgan = morgan(morganJson(":method :url :status :res[content-length] bytes :response-time ms"));

exports.log = console.log;
exports.colors = colors;

