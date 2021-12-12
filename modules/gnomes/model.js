const frameWorkMongoDb = require("../../framework/database/mongodb");
const {ZERO_ADDRESS} = require("../blockchain_sync/constants");

const collectionName = "gnomes";
const collection = () => frameWorkMongoDb.getCollection(collectionName);

exports.collection = collection;


exports.createMany = function create(payload) {
	return collection().insertMany(payload);
};
exports.create = function create(payload) {
	return collection().insertOne(payload);
};
exports.setHighestGnomeInCollection = async function setHighestGnomeInCollection(address, gnomeId) {
	const gnome = await collection().findOne({public_address: address, gnome_id: gnomeId}, {sort: {level: -1}});
	await collection().updateMany({
		public_address: address,
		gnome_id: gnomeId,
		in_collection: true
	}, {$set: {in_collection: false}});
	return collection().updateOne({token_id: gnome.token_id}, {$set: {in_collection: true}});
};
exports.getGnomeByTokenId = function getGnomeByTokenId(tokenId) {
	return collection().findOne({token_id: tokenId});
};
exports.changeTokenOwner = function changeTokenOwner(tokenId, address, burned = false) {

	if (address === ZERO_ADDRESS) {
		burned = true;
	}
	return collection().updateOne({token_id: Number(tokenId)}, {
		$set: {
			public_address: address.toLowerCase(),
			in_collection: false,
			burned
		}
	});
};

exports.changeInCollection = function changeInCollection(oldTokenId, newTokenId) {
	return collection().bulkWrite([
		{
			updateOne: {
				"filter": {"token_id": Number(oldTokenId)},
				"update": {$set: {"in_collection": false}}
			}
		},
		{
			updateOne: {
				"filter": {"token_id": Number(newTokenId)},
				"update": {$set: {"in_collection": true}}
			}
		},
	]);

};