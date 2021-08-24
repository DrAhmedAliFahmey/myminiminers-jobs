const gnomesModel = require("../model");
const {INCREASE_PRODUCTIVITY_INTERVAL} = require("../constants");

exports.increaseGnomeProductivity = async function increaseGnomeProductivity() {

	try {
		await gnomesModel.increaseLazyGnomesProductivity();

	} catch (e) {
		console.error(e);
	}
	setTimeout(increaseGnomeProductivity, INCREASE_PRODUCTIVITY_INTERVAL);
};
