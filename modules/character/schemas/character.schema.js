const Joi = require("@hapi/joi");

exports.characterSchema = Joi.object({

	public_address: Joi.string().required(),
	level: Joi.number().required(),
	power: Joi.number().required(),
});
