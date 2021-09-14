const frameWorkMongoDb = require("../../framework/database/mongodb");
const {COLLECTION_BY_INDEX} = require("../../gnomes/constants");
const collectionName = "users";
const collection = () => frameWorkMongoDb.getCollection(collectionName);

exports.collection = collection;

collection().createIndex({public_address: 1}, {unique: true});

exports.getUserByAddress = function getUserByAddress(address) {
	return collection().findOne({public_address: address});
};

exports.createUser = function createUser(payload) {
	return collection().insertOne(payload);
};

exports.updatePower = function updatePower(address, collection, collectionPower, playerPower) {
	const updateObj = {
		["collectionsPower." + collection]: Number(collectionPower),
		power: Number(playerPower)
	};
	return collection().updateOne({public_address: address}, {$set: updateObj});
};

