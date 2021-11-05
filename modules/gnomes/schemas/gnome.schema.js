const Joi = require("@hapi/joi");

exports.gnomeSchema = Joi.object({
	token_id: Joi.number().min(1).required(),
	gnome_id: Joi.number().required(),
	public_address: Joi.string().required(),
	created_at: Joi.date().required(),
	name: Joi.string().required(),
	full_name: Joi.string().required(),
	description: Joi.string().required(),
	rarity: Joi.string().allow(),
	collection: Joi.string().required(),
	in_collection: Joi.boolean().required(),
	level: Joi.number().min(1).max(10).required(),
	burned: Joi.boolean().required(),
	transfer_at_block: Joi.number().required()
});
