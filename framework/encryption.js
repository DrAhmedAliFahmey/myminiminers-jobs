const {getEncryptionSecret} = require("../conifg");
const cryptrSecret = getEncryptionSecret();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const crypto = require("crypto"),
	password = "dfgj89e4tjKLAJDSD89GHkahdfds89gh",
	iv = "asd84hhksdds5gfs";

function _encrypt(text) {
	let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(password), Buffer.from(iv));
	let encrypted = cipher.update(text);
	encrypted = Buffer.concat([encrypted, cipher.final()]);
	return  encrypted.toString("hex");
}

function _decrypt(text) {
	let encryptedText = Buffer.from(text, "hex");
	let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(password), Buffer.from(iv));
	let decrypted = decipher.update(encryptedText);
	decrypted = Buffer.concat([decrypted, decipher.final()]);
	return decrypted.toString();
}


exports.encrypt = function encrypt(value) {
	return _encrypt(value);
};
exports.decrypt = function decrypt(value) {
	return _decrypt(value);
};

exports.hash = function hash(str, rounds = saltRounds) {
	return bcrypt.hash(str, rounds);
};

exports.compare = function compare(original, hash) {
	return bcrypt.compare(original, hash);
};
