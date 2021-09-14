const {getJoiOptions} = require("../../conifg");
const joiOptions = getJoiOptions();
const {getRandomInt, getRandomIndex} = require("../../framework/utils/random");
const {shuffle} = require("../../framework/utils/types/array");
const {userSchema} = require("./schemas/user.schema");
const {uniqueNamesGenerator, adjectives, colors, animals} = require("unique-names-generator");
const {COLLECTION_BY_INDEX} = require("../gnomes/constants");
const backgroundColors = [
	"#fdd75b",
	"#d9fef1",
	"#37bc94",
	"#6ec995",
	"#dad5c7",
	"#aa6ee9",
	"#6c9f9b",
	"#ac4e5e",
	"#75819f",
	"#e95d56",
	"#6b6241",
	"#ffe7c7",
	"#a8d4dc",
	"#4d5084",
	"#7664c1",
	"#f3d0d6",
	"#b99460",
	"#e94f07",
	"#f8fb98",
	"#f4d68e",
	"#ffacd0",
	"#c8edca",
	"#ffaf7e",
	"#f2f9e9",
	"#2ff4e6",
	"#fada73",
	"#ffefc6",
	"#4b4947",
	"#d5e9c4",
	"#6b84e3",
	"#c9accc",
	"#d7d7d7",
	"#007cf4",
	"#f7dde0",
];
// eslint-disable-next-line max-lines-per-function
exports.getNewUserDefaultValues = function getNewUserDefaultValues() {
	const nameOptions = [adjectives, colors, animals];
	shuffle(nameOptions);
	const namesConfig = {
		dictionaries: nameOptions,
		length: 2,
		style: "capital"
	};
	const collectionsPower = {};
	COLLECTION_BY_INDEX.forEach(collection => {
		collectionsPower[collection] = 0;
	});
	return {
		created_at: new Date(),
		nickname: uniqueNamesGenerator(namesConfig),
		avatar: getRandomInt(1, 80).toString(),
		avatar_color: backgroundColors[getRandomIndex(backgroundColors)],
		power: 0,
		collectionsPower
	};
};


exports.validateRegistration = function validateRegistration(payload) {
	const {error, value} = userSchema.validate(payload, joiOptions);
	if (error) {
		throw new Error(error);
	}
	return value;
};

