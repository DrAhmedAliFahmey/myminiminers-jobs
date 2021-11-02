const Joi = require("@hapi/joi");

exports.userSchema = Joi.object({
	created_at: Joi.date().required(),
	avatar: Joi.string().required(),
	avatar_color: Joi.string().required(),
	nickname: Joi.string().min(2).required(),
	public_address: Joi.string().lowercase().trim().required(),
	power: Joi.number().required(),
	collectionsPower: Joi.object().required()
});
