const bodyParser = require("body-parser");

function isMultipartRequest(req) {
	let contentTypeHeader = req.headers["content-type"];
	return contentTypeHeader && contentTypeHeader.indexOf("multipart") > -1;
};

exports.bodyParserJsonMiddleware = function bodyParserJsonMiddleware(options) {
	return function (req, res, next) {
		if (isMultipartRequest(req)) {
			return next();
		}
		return bodyParser.json(options)(req, res, next);
	};
};

exports.bodyParserJsonUrlencodedMiddleware = function bodyParserJsonUrlencodedMiddleware(options) {
	return function (req, res, next) {
		if (isMultipartRequest(req)) {
			return next();
		}
		return bodyParser.urlencoded({
			extended: true,
			limit: "2mb"
		})(req, res, next);
	};
};


