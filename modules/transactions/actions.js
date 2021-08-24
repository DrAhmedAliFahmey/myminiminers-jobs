const {getJoiOptions} = require("../../conifg");
const joiOptions = getJoiOptions();
const httpErrors = require("../../framework/errors/httpErrors");
const {STATUS, TRANSACTION_TYPE} = require("./constants");
const {getRandomHex} = require("../../framework/utils/random");
const {transactionSchema} = require("./schemas/transaction.schema");


exports.validate = function (transaction) {

	const {error, value} = transactionSchema.validate(transaction, joiOptions);
	if (error) {
		throw httpErrors.unprocessableEntity(error);
	}
	return value;
};

// eslint-disable-next-line max-lines-per-function
exports.setBuyGameBundlePayload = function setBuyGameBundlePayload(user, bundle, blockchainTransaction) {
	return {
		type: TRANSACTION_TYPE.CLAIM,
		created_at: new Date(),
		user_id: user._id.toString(),
		hash: getRandomHex(30),
		amount: bundle.amount,
		user_public_address: user.public_address,
		status: STATUS.SUCCESS,
		in_process: blockchainTransaction.transactionHash,
		blockchain_message: "",
		blockchain_block_number: blockchainTransaction.blockNumber,
		blockchain_transaction_id: blockchainTransaction.transactionHash
	};
};

// eslint-disable-next-line max-lines-per-function
exports.setBuyPayload = function setBuyPayload(user, blockchainTransaction) {
	return {
		type: TRANSACTION_TYPE.BUY,
		created_at: new Date(),
		user_id: user._id.toString(),
		hash: getRandomHex(30),
		amount: 0,
		gnome_id: blockchainTransaction.returnValues.itemId,
		user_public_address: user.public_address,
		status: STATUS.SUCCESS,
		in_process: blockchainTransaction.transactionHash,
		blockchain_message: "",
		blockchain_block_number: blockchainTransaction.blockNumber,
		blockchain_transaction_id: blockchainTransaction.transactionHash
	};
};
// eslint-disable-next-line max-lines-per-function
exports.setRemovePayload = function setRemovePayload(user, blockchainTransaction) {
	return {
		type: TRANSACTION_TYPE.REMOVE,
		created_at: new Date(),
		user_id: user._id.toString(),
		hash: getRandomHex(30),
		amount: 0,
		gnome_id: blockchainTransaction.returnValues.itemId,
		user_public_address: user.public_address,
		status: STATUS.SUCCESS,
		in_process: blockchainTransaction.transactionHash,
		blockchain_message: "",
		blockchain_block_number: blockchainTransaction.blockNumber,
		blockchain_transaction_id: blockchainTransaction.transactionHash
	};
};

