const frameWorkMongoDb = require("../../framework/database/mongodb");
const collectionName = "general_storage";
const collection = () => frameWorkMongoDb.getCollection(collectionName);

exports.collection = collection;
collection().createIndex({name: 1}, {unique: true});

exports.updateWaitingBlockToGetProcessed = function updateWaitingBlockToGetProcessed(contract ,blockNumber) {
	return collection().updateOne({name: "waitingBlockToGetProcessed"}, {$set: {[`block_number.${contract}`]: blockNumber}}, {upsert: true});
};

exports.getWaitingBlockToGetProcessed = function getWaitingBlockToGetProcessed(contract) {
	return collection().findOne({name: "waitingBlockToGetProcessed"}).then(result => result && result[`block_number.${contract}`] || 0);
};

