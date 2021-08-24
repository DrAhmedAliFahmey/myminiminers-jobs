function hasKey(object, ...rest) {
	if (typeof object !== "object" || object === null) {
		return false;
	}
	let ref = object;
	for (const key in rest) {
		ref = ref[rest[key]];
		if (ref === undefined) {
			return false;
		}
	}
	return true;
}

exports.hasKey = hasKey;
