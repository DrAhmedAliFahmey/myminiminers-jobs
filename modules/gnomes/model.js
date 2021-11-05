const frameWorkMongoDb = require("../../framework/database/mongodb");
const {ZERO_ADDRESS} = require("../blockchain_sync/constants");

const collectionName = "gnomes";
const collection = () => frameWorkMongoDb.getCollection(collectionName);

exports.collection = collection;


exports.create = function create(payload) {
	return collection().insertOne(payload);
};


exports.changeTokenOwner = function changeTokenOwner(tokenId, address, blockNumber, burned = false) {

	if (address === ZERO_ADDRESS) {
		burned = true;
	}
	return collection().updateOne({public_address: address.toLowerCase()}, {
		$set: {
			token_id: Number(tokenId),
			in_collection: false,
			transfer_at_block: blockNumber,
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