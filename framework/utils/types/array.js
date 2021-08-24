const {getRandomInt} = require("../random");
const {ObjectId} = require("../../database/mongodb");
exports.findAndRemoveByObject = function (array, key, value) {
	array.forEach((obj, i) => {
		if (typeof obj === "object" && obj !== null && obj[key] === value) {
			array.splice(i, 1);
		}
	});
};

exports.spliceRandom = function (arr) {
	const index = getRandomInt(0, arr.length - 1);
	return arr.splice(index, 1);
};

exports.mongoObjectIdsToStrings = function (arr, keys) {
	mongoObjectIdsArrManipulation(arr, keys, "string");
};
exports.mongoStringIdsToObjects = function (arr, keys) {
	mongoObjectIdsArrManipulation(arr, keys, "object");
};

exports.convertHistoryToObject = function (arr) {
	let history = [];
	const parsedArray = arr.map((item) => {
		return item.split(",").map((e) => {
			return e.split(": ");
		});
	});

	parsedArray.forEach((el) => {
		let item = {
			Date: el[0][1],
			Open: Number(el[1][1]),
			High: Number(el[2][1]),
			Low: Number(el[3][1]),
			Close: Number(el[4][1]),
			Volume: el[5][1],
			Average: el[6][1],
			BarCount: el[7][1],
		};
		history.push(item);
	});
	return history;
};

function mongoObjectIdsArrManipulation(arr, keys, objectOrString) {
	if (!keys || keys.length === 0 || !arr || arr.length === 0) {
		return;
	}
	if (typeof keys === "string") {
		keys = [keys];
	}
	arr.forEach(value => {
		keys.forEach(key => {
			const [ref, realKey] = getKeyFormObject(value, key);
			if (ref && ref[realKey]) {
				ref[realKey] = objectOrString === "object" ? new ObjectId(ref[realKey]) : ref[realKey].toString();
			}
		});
	});


}

function getKeyFormObject(ref, key) {
	const splitKeys = key.split(".");
	for (let i = 0; i < splitKeys.length - 1; i++) {
		ref = ref[splitKeys[i]];
	}
	return [ref, splitKeys.pop()];
}
