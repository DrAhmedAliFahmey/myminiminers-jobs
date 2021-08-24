const Joi = require("@hapi/joi");
const {TRANSACTION_TYPE, STATUS} = require("../constants");

exports.transactionSchema = Joi.object({
	type: Joi.string().valid.apply(Joi, Object.values(TRANSACTION_TYPE)).required(),
	created_at: Joi.date().required(),
	user_id: Joi.objectId(),
	user_public_address: Joi.string().required(),
	hash: Joi.string().min(40).required(),
	gnome_id: Joi.when("type", {is: TRANSACTION_TYPE.SEll_GNOME, then: Joi.objectId().required()}),
	amount: Joi.number().min(0.01).required(),
	status: Joi.string().valid.apply(Joi, Object.values(STATUS)).required(),
	in_process: Joi.string().required(),// true if its in process, hash string if false. its a string because of the unique index
	blockchain_message: Joi.string().allow(""),
	blockchain_transaction_id: Joi.string().allow(""),
	blockchain_block_number: Joi.number()
});
