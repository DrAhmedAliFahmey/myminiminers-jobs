exports.getRandomInt = (min, max) => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};


exports.getRandomIndex = (arr) => {
	return this.getRandomInt(0, arr.length - 1);
};


