const Joi = require("@hapi/joi");

exports.userSchema = Joi.object({

	public_address: Joi.string().required(),
	created_at: Joi.date().required(),
	name: Joi.string().allow(""),
	level: Joi.number().required(),
	power: Joi.number().required(),
});
