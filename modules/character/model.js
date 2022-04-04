const frameWorkMongoDb = require("../../framework/database/mongodb");

const collectionName = "characters";
const collection = () => frameWorkMongoDb.getCollection(collectionName);

exports.collection = collection;

exports.upsert = function upsert(address, level, power) {
	return this.collection().updateOne({public_address: address}, {$set: {level, power}}, {upsert: true});
};
