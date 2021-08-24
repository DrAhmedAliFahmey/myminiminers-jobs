const httpStatus = require("http-status");
const PrettyError = require("pretty-error");
const config = require("../../conifg");
const errToJSON = require("error-to-json");
setErrorsModifier();

function setErrorsModifier() {
	if (config.getNodeEnv() === "development") {
		const pe = new PrettyError();
		pe.skipNodeFiles();
		pe.skipPackage("express");
		pe.start();
		return;
	}
	setJsonError();
}

function setJsonError() {
	const originalConsoleError = console.error;
	console.error = function () {
		[...arguments].forEach(e => {
			try {
				originalConsoleError(errToJSON(e));
			} catch (e) {
				originalConsoleError(e);
			}

		});
	};
}


exports.errorHandler = function errorHandler(err, req, res, next) {
	console.error(err);
	const message = process.env.NODE_ENV === "development" || err.status <500 ? err.message : httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
	res.status(err.status || httpStatus.INTERNAL_SERVER_ERROR).json({message});
};


function handleUnhandledRejection() {
	process.on("unhandledRejection", (reason) => {
		console.error({name: "Unhandled Rejection:", reason: reason});
	});
}

handleUnhandledRejection();
