const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);
if (!("toJSON" in Error.prototype)) {
	Object.defineProperty(Error.prototype, "toJSON", {
		value: function () {
			const alt = {};
			Object.getOwnPropertyNames(this).forEach(function (key) {
				alt[key] = this[key];
			}, this);

			return alt;
		},
		configurable: true,
		writable: true
	});
}

if (!("isJsonObject" in Object.prototype)) {
	Object.defineProperty(Object.prototype, "isJsonObject", {
		value: function (obj) {
			return typeof obj === "object" && obj !== null && Array.isArray(obj) === false;
		}
	});
}

