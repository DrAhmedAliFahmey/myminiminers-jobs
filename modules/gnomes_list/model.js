const frameWorkMongoDb = require("../../framework/database/mongodb");
const collectionName = "gnomes_list";
const collection = () => frameWorkMongoDb.getCollection(collectionName);


exports.collection = collection;

exports.removeAll = function removeAll() {
	return collection().removeMany();

};

exports.get = function get() {
	return collection().find().toArray();
};

exports.getById = function getById(id) {
	return collection().findOne({gnome_id: id});
};
