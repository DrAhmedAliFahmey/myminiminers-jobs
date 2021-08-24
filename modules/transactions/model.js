const frameWorkMongoDb = require("../../framework/database/mongodb");
const collectionName = "transactions";
const collection = () => frameWorkMongoDb.getCollection(collectionName);

const transactionStatus = {
	WAITING_TO_GET_PAID: "waiting_to_get_paid",
	PAID: "paid",
	IN_PROCESS: "in_process",
	SUCCESS: "success",
	FAILED: "failed",
	DELIVERED: "delivered"
};
exports.TRANSACTION_STATUS = transactionStatus;


exports.collection = collection;

exports.updatePayedTransaction = function updatePayedTransaction({hash, blockNumber, blockChainTransactionHash}) {
	return collection().updateOne(
		{hash, type: "claim"},
		{
			$set:
				{
					status: transactionStatus.PAID,
					blockchain_block_number: blockNumber,
					blockchain_transaction_id: blockChainTransactionHash
				}
		});

};
exports.updateStatus = function updateStatus(hash, status) {
	return collection().updateOne({hash}, {$set: {status}});
};
exports.updateFailedStatus = function updateFailedStatus(hash, status, errMessage) {
	return collection().updateOne({hash}, {
		$set: {
			status: transactionStatus.FAILED,
			blockchain_message: errMessage,
			in_process: hash
		}
	});
};

exports.updateSuccess = function updateSuccess(hash, transaction) {
	return collection().updateOne({hash}, {
		$set: {
			status: transactionStatus.SUCCESS,
			blockchain_transaction_id: transaction.transactionHash,
			blockchain_block_number: transaction.blockNumber,
		}
	});
};

exports.updateDelivered = function updateDelivered(hash) {
	return collection().updateOne({hash}, {
		$set: {
			status: transactionStatus.DELIVERED,
		}
	});
};

exports.getNeedToProcessPayedTransactions = async function getNeedToProcessPayedTransactions(currentBlockMinusConfirmsNeeded) {
	if (currentBlockMinusConfirmsNeeded <= 0) {
		return [];
	}
	return collection().find({
		status: transactionStatus.PAID,
		blockchain_block_number: {$lte: currentBlockMinusConfirmsNeeded}
	}).toArray();


};
exports.getNeedToProcessSuccessTransactions = async function getNeedToProcessSuccessTransactions(currentBlockMinusConfirmsNeeded) {
	if (currentBlockMinusConfirmsNeeded <= 0) {
		return [];
	}
	return collection().find({
		status: transactionStatus.SUCCESS,
		blockchain_block_number: {$lte: currentBlockMinusConfirmsNeeded}
	}).toArray();
};


exports.setTransactionStatus = function setTransactionStatus(id, status) {
	return collection().updateOne(
		{_id: frameWorkMongoDb.ObjectId(id)},
		{$set: {status}});
};

exports.create = function create(payload) {
	payload.user_id = frameWorkMongoDb.ObjectId(payload.user_id);
	if(payload.gnome_id){
		payload.gnome_id = frameWorkMongoDb.ObjectId(payload.gnome_id);
	}
	return collection().insertOne(payload);
};
