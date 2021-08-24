const frameWorkMongoDb = require("../../framework/database/mongodb");
const collectionName = "users";
const collection = () => frameWorkMongoDb.getCollection(collectionName);

exports.collection = collection;

exports.updateTokens = function updateTokens(gnomes, session) {
	if (gnomes.length === 0) {
		return;
	}
	const bulk = gnomes.map(gnome => {
		gnome.total_coins_mined = Number(gnome.total_coins_mined);
		if (Number.isNaN(gnome.total_coins_mined)) {
			return;
		}
		return {
			updateOne: {
				"filter": {_id: frameWorkMongoDb.ObjectId(gnome.user_id)},
				"update": {$inc: {total_mined_tokens: gnome.total_coins_mined}},
			}
		};

	});
	return collection().bulkWrite(bulk, {session});
};
exports.updateMintSuccess = function updateMintSuccess(userId, amount) {
	amount = Number(amount);
	if (Number.isNaN(amount)) {
		return;
	}
	return collection().updateOne({_id: frameWorkMongoDb.ObjectId(userId)}, {$inc: {total_claimed_tokens: amount}});
};

exports.getUserByAddress = function getUserByAddress(address) {
	return collection().findOne({public_address: address});
};

exports.addSpins = function addSpins(userId, amount) {
	amount = Number(amount);
	if (Number.isNaN(amount)) {
		return;
	}
	return collection().updateOne({_id: frameWorkMongoDb.ObjectId(userId)},
		{
			$inc: {
				available_spins: amount
			}

		}
	);
};
