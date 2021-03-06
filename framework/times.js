const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const YEAR = DAY * 365.24;
const NORMAL_YEAR = DAY * 365;
const LEAP_YEAR = DAY * 366;
const DECADE = 10 * YEAR;
const HALF_YEAR = YEAR / 2;
const AVERAGE_MONTH = YEAR / 12;

exports.TIME_IN_MILI = {
	SECOND,
	MINUTE,
	HOUR,
	DAY,
	WEEK,
	YEAR,
	NORMAL_YEAR,
	LEAP_YEAR,
	DECADE,
	HALF_YEAR,
	AVERAGE_MONTH
};

exports.TIME_IN_SECONDS = {
	SECOND: SECOND / 1000,
	MINUTE: MINUTE / 1000,
	HOUR: HOUR / 1000,
	DAY: DAY / 1000,
	WEEK: WEEK / 1000,
	YEAR: YEAR / 1000,
	NORMAL_YEAR: NORMAL_YEAR / 1000,
	LEAP_YEAR: LEAP_YEAR / 1000,
	DECADE: DECADE / 1000,
	HALF_YEAR: HALF_YEAR / 1000,
	AVERAGE_MONTH: AVERAGE_MONTH / 1000
};
