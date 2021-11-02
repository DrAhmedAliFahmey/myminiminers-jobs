const frameWorkMongoDb = require("../../framework/database/mongodb");

const collectionName = "gnomes";
const collection = () => frameWorkMongoDb.getCollection(collectionName);

exports.collection = collection;


exports.create = function create(payload) {
	return collection().insertOne(payload);
};

exports.deleteGnomeByTokenId = function deleteGnomeByTokenId(tokenId) {
	return collection().removeOne({token_id: Number(tokenId)});
};

exports.changeTokenOwner = function changeTokenOwner(tokenId, address, blockNumber) {
	return collection().updateOne({public_address: address.toLowerCase()}, {
		$set: {
			token_id: Number(tokenId),
			in_collection: false,
			transfer_at_block: blockNumber
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