const httpStatus = require("http-status");

function validateCode(code) {
	if (!httpStatus[code]) {
		throw new Error("invalid http code");
	}
}

const createError = ({status = 500, message = "Something went wrong"}) => {
	const error = new Error(JSON.stringify(message));
	error.status = status;
	return error;
};

function setErrAdditionalParams(err, rest) {
	if (!Object.isJsonObject(rest)) {
		return;
	}
	Object.keys(rest).forEach(key => {
		err[key] = rest[key];
	});
}

function httpError(status, message, ...rest) {
	validateCode(status);
	const err = createError({status, message});
	setErrAdditionalParams(err, rest);
	return err;

}

function formatJoiError(message) {
	if (Object.isJsonObject(message) && message.isJoi === true) {
		return message.details.map(error => {
			const {message, context} = error;
			return {message, key: context.key};
		});
	}
	return message;
}

exports.unauthorizedError = function (message = httpStatus[httpStatus.UNAUTHORIZED]) {
	return httpError(httpStatus.UNAUTHORIZED, message);
};

exports.goneError = function (message = httpStatus[httpStatus.GONE]) {
	return httpError(httpStatus.GONE, message);

};

exports.unprocessableEntity = function unprocessableEntity(message) {
	message = formatJoiError(message);
	return httpError(httpStatus.UNPROCESSABLE_ENTITY, message);
};

exports.notFound = function notFound(message) {
	return httpError(httpStatus.NOT_FOUND, message);
};

exports.conflict = function conflict(message) {
	return httpError(httpStatus.CONFLICT, message);
};
