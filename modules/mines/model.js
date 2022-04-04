const frameWorkMongoDb = require("../../framework/database/mongodb");
const {ZERO_ADDRESS} = require("../blockchain_sync/constants");

const collectionName = "mines";
const collection = () => frameWorkMongoDb.getCollection(collectionName);

exports.collection = collection;
collection().createIndex({id: 1}, {unique: true});

exports.create = function create(mine) {
	return this.collection().insertOne(mine);

};

exports.removePlayerFromMine = function removePlayerFromMine(account, mineId) {
	return this.collection().updateOne({"miner.account": account, id: mineId}, {
		$set: {
			miner: {
				account: ZERO_ADDRESS,
				start_time: 0,
				collection_id: 0
			}
		}
	});

};
exports.addPlayerFromMine = function removePlayerFromMine(account, mineId, collectionId, startTime) {
	return this.collection().updateOne({id: mineId}, {
		$set: {
			miner: {
				account: account,
				start_time: startTime,
				collection_id: collectionId
			}
		}
	});

};
