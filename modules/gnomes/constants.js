const {TIME_IN_MILI} = require("../../framework/times");
exports.CURRENT_STATE = {
	DOING_NOTHING: "doing_nothing",
	ON_TO_MARKETPLACE: "on_the_marketplace",
	MINING: "mining"
};


exports.PRODUCTIVITY_REDUCE_TIME = 0.001;


exports.INCREASE_PRODUCTIVITY_INTERVAL = TIME_IN_MILI.SECOND * 5;
