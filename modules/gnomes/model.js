const frameWorkMongoDb = require("../../framework/database/mongodb");
const {INCREASE_PRODUCTIVITY_INTERVAL} = require("./constants");
const {CURRENT_STATE, PRODUCTIVITY_REDUCE_TIME} = require("./constants");
const collectionName = "gnomes";
const collection = () => frameWorkMongoDb.getCollection(collectionName);

exports.collection = collection;


exports.changeStatus = function changeStatus(gnomeId, status) {
	return collection().updateOne({_id: frameWorkMongoDb.ObjectId(gnomeId)}, {current_state: status});
};

exports.changeStatuses = function changeStatuses(gnomeIds, status, session) {
	if (gnomeIds.length === 0) {
		return;
	}
	return collection().updateMany({_id: gnomeIds.map(id => frameWorkMongoDb.ObjectId(id))}, {$set: {current_state: status}}, {session});
};

exports.increaseLazyGnomesProductivity = function increaseLazyGnomesProductivity() {

	return collection().updateMany(
		{productivity: {$lt: 100}, current_state: {$ne: CURRENT_STATE.MINING}},
		{$inc: {productivity: PRODUCTIVITY_REDUCE_TIME * 7 * INCREASE_PRODUCTIVITY_INTERVAL}}
	);
};

exports.updateSellSuccess = function updateSellSuccess(gnomeId, amount) {
	return collection().updateOne({_id: frameWorkMongoDb.ObjectId(gnomeId)}, {
		current_state: CURRENT_STATE.ON_TO_MARKETPLACE,
		market: {
			created_at: new Date(),
			price: amount
		}
	});
};

exports.updateGnomeTransferSuccess = function updateGnomeTransferSuccess(userId, gnomeId) {
	return collection().updateOne({_id: frameWorkMongoDb.ObjectId(gnomeId)}, {
		$set: {user_id: frameWorkMongoDb.ObjectId(userId), market: null, current_state: CURRENT_STATE.DOING_NOTHING}
	});
};
exports.updateGnomeRemoveSuccess = function updateGnomeRemoveSuccess(userId, gnomeId) {
	return collection().updateOne({
		_id: frameWorkMongoDb.ObjectId(gnomeId),
		user_id: frameWorkMongoDb.ObjectId(userId)
	}, {
		$set: {market: null, current_state: CURRENT_STATE.DOING_NOTHING}
	});
};
