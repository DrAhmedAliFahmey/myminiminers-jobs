require("dotenv").config();
require("console-from");
require("./framework/proto");

const {program} = require("commander");
program.option("--accounts", "");
const Web3 = require("web3");
program.parse(process.argv);

(async () => {
	try {
		if (program.accounts !== undefined) {
			const web3 = new Web3();
			for (let i = 0; i < 4; i++) {
				console.log(await web3.eth.accounts.create("g54390AKLadfj943fj90SKFJ0924fklj"));
			}
		}
		if (program.buy !== undefined) {
			const web3 = new Web3("https://polygon-rpc.com");
		}

	} catch (e) {
		console.error(e);
	}
})();
