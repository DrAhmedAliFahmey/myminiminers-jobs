const {httpClient} = require("../../../framework/tests/http_client");
const {expect} = require("chai");
const frameworkMongodb = require("../../../framework/database/mongodb");


describe("Gnome API", () => {
	before(async () => {
		await frameworkMongodb.connect({});

	});
	after(async () => {
		await frameworkMongodb.close();

	});
	describe("Post /register", () => {


	});
});


