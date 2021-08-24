require("dotenv").config();
require("console-from");
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.CHAIN_PROVIDER));
const fs = require("fs");
const path = require("path");
const transactionModel = require("../../transactions/model");
const {TRANSACTION_STATUS} = require("../model");


const MyMiniMinersAbi = JSON.parse(fs.readFileSync(path.resolve("modules/transactions/MyMiniMiners.json"), "utf8"));
const GameActionsAbi = JSON.parse(fs.readFileSync(path.resolve("modules/transactions/GameActions.json"), "utf8"));


const MyMiniMiners = new web3.eth.Contract(MyMiniMinersAbi.abi, process.env.MYMINIMINERS_CONTART_ADDRESS);
const GameActions = new web3.eth.Contract(GameActionsAbi.abi, process.env.GAMEACTIONS_CONTART_ADDRESS);
const gameActionsAccount = web3.eth.accounts.privateKeyToAccount(process.env.GAME_SERVICE_ACCOUNT);
web3.eth.accounts.wallet.add(process.env.GAME_SERVICE_ACCOUNT);
web3.eth.accounts.wallet.add("ac77d5a6cb6962ba50379c3170024c61750199a979faa8d95aaea00e8ce24f2f");

describe("Transactions", () => {
	before(async () => {

	});
	after(async () => {

	});
	describe("mint", () => {
		// async function payForAppTransaction() {
		// 	const gasFee = Number(await MyMiniMiners.methods.getGasFee().call());
		// 	const transaction = await MyMiniMiners.methods.payForAppTransaction(
		// 		"1111111111111111111111111111111111111111111111111111111")
		// 		.send({from: "0x778f0E43Da2151149844619C310C5D47e34f0F70", value: gasFee, gasPrice: 0});
		// }

		MyMiniMiners.methods.mint(
			"0x26512Fd0a3FccAA9974dF766552C1872782d46C1",
			Number(web3.utils.toWei("1", "gwei")),
			"1111111111111111111111111111111111111111111111111111111",
		).send({
			from: gameActionsAccount.address,
			gasLimit: 400000,
			gasPrice: web3.utils.toWei("10", "gwei")
		}).then(console.log).catch(console.error);

	});
});


