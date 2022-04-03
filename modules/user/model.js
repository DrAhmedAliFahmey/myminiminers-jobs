const frameWorkMongoDb = require("../../framework/database/mongodb");

const collectionName = "users";
const collection = () => frameWorkMongoDb.getCollection(collectionName);

exports.collection = collection;

exports.create()
