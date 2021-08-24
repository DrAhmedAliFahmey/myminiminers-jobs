const Web3 = require("web3");
const fs = require("fs");
const path = require("path");
const transactionModel = require("../../transactions/model");
const userModel = require("../../user/model");
const gnomesModel = require("../../gnomes/model");
const {TRANSACTION_TYPE} = require("../constants");
const {TRANSACTION_STATUS} = require("../model");
const transactionsActions = require("../actions");
const settingsModel = require("../../settings/model");
const options = {
	timeout: 30000, // ms

	clientConfig: {

		// Useful to keep a connection alive
		keepalive: true,
		keepaliveInterval: -1 // ms
	},

	// Enable auto reconnection
	reconnect: {
		auto: true,
		delay: 1000, // ms
		maxAttempts: 99999999999,
		onTimeout: false
	}
};
const web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.CHAIN_PROVIDER, options));

const MyMiniMinersAbi = JSON.parse(fs.readFileSync(path.resolve("modules/transactions/MyMiniMiners.json"), "utf8"));
const GameActionsAbi = JSON.parse(fs.readFileSync(path.resolve("modules/transactions/GameActions.json"), "utf8"));


const MyMiniMiners = new web3.eth.Contract(MyMiniMinersAbi.abi, process.env.MYMINIMINERS_CONTART_ADDRESS);
const GameActions = new web3.eth.Contract(GameActionsAbi.abi, process.env.GAMEACTIONS_CONTART_ADDRESS);
const gameActionsAccount = web3.eth.accounts.privateKeyToAccount(process.env.GAME_SERVICE_ACCOUNT);
web3.eth.accounts.wallet.add(process.env.GAME_SERVICE_ACCOUNT);


function handleMintEvent() {

	MyMiniMiners.events.Mint({}, function (error, event) {
		if (error) {
			return console.error(error);
		}

		//console.log(event);
	});
}

function handlePayForAppTransactionEvent() {

	MyMiniMiners.events.PayForAppTransaction({}, function (error, event) {
		console.log(event);
		if (error) {
			console.error(error);
			throw error;
		}

		transactionModel.updatePayedTransaction({
			hash: event.returnValues.appTransactionId,
			blockNumber: event.blockNumber,
			blockChainTransactionHash: event.transactionHash
		}).catch(console.error);
		//web3.eth.getTransactionReceipt(event.transactionHash).then((r) => console.log("getTransactionReceipt", r));
	});
}

function handleBuyGameBundleEvent() {

	GameActions.events.BuyGameBundle({}, async function (error, event) {
		if (error) {
			console.error(error);
			throw error;
		}

		const user = await userModel.getUserByAddress(event.returnValues.from);
		const bundle = settingsModel.getBundleById(event.returnValues.id);
		const payload = transactionsActions.setBuyGameBundlePayload(user, bundle, event);
		const validatedPayload = transactionsActions.validate(payload);
		await transactionModel.create(validatedPayload);
	});
}

function handleBuyEvent() {

	GameActions.events.Buy({}, async function (error, event) {
		if (error) {
			console.error(error);
			throw error;
		}

		const user = await userModel.getUserByAddress(event.returnValues.from);
		const payload = transactionsActions.setBuyPayload(user, event);
		const validatedPayload = transactionsActions.validate(payload);
		await transactionModel.create(validatedPayload);


	});
}

function handleRemoveEvent() {

	GameActions.events.Remove({}, async function (error, event) {
		if (error) {
			console.error(error);
			throw error;
		}

		const user = await userModel.getUserByAddress(event.returnValues.from);
		const payload = transactionsActions.setRemovePayload(user, event);
		const validatedPayload = transactionsActions.validate(payload);
		await transactionModel.create(validatedPayload);
	});
}


async function processPayedTransactions(transactions, gasPrice, type, func) {
	try {

		transactions = transactions.filter(transaction => transaction.type = type);
		for (let i in transactions) {
			const transaction = transactions[i];
			await transactionModel.updateStatus(transaction.hash, TRANSACTION_STATUS.IN_PROCESS);
			func(transaction, gasPrice);
		}
	} catch (e) {
		console.error(e);
	}
}

async function processSuccessTransactions(transactions, type, func) {
	try {

		transactions = transactions.filter(transaction => transaction.type = type);
		for (let i in transactions) {
			const transaction = transactions[i];
			await func(transaction);
		}
	} catch (e) {
		console.error(e);
	}
}

async function successRemove(transaction) {
	await transactionModel.updateDelivered(transaction.hash);
	return gnomesModel.updateGnomeRemoveSuccess(transaction.user_id, transaction.gnome_id);

}

async function successBuy(transaction) {
	await transactionModel.updateDelivered(transaction.hash);
	return gnomesModel.updateGnomeTransferSuccess(transaction.user_id, transaction.gnome_id);

}

async function successMint(transaction) {
	await transactionModel.updateDelivered(transaction.hash);
	return userModel.updateMintSuccess(transaction.user_id, transaction.amount);

}

async function successBuyGameBundle(transaction) {
	await transactionModel.updateDelivered(transaction.hash);
	return userModel.addSpins(transaction.user_id, transaction.amount);
}

async function successSell(transaction) {
	await transactionModel.updateDelivered(transaction.hash);
	return gnomesModel.updateSellSuccess(transaction.gnome_id, transaction.amount);
}

async function mint(transaction, gasPrice) {
	try {
		const mintTransaction = await MyMiniMiners.methods.mint(
			transaction.user_public_address,
			Number(web3.utils.toWei(transaction.amount.toString(), "gwei")),
			transaction.hash,
		).send({
			from: gameActionsAccount.address,
			gasLimit: 400000,
			gasPrice: gasPrice
		});
		await transactionModel.updateSuccess(transaction.hash, mintTransaction);

	} catch (e) {
		await transactionModel.updateFailedStatus(transaction.hash, e.message);
	}
}


async function sell(transaction, gasPrice) {
	try {
		const sellTransaction = await GameActions.methods.sell(
			transaction.user_public_address,
			transaction.gnome_id.toString(),
			Number(web3.utils.toWei(transaction.amount.toString(), "gwei")),
		).send({
			from: gameActionsAccount.address,
			gasLimit: 400000,
			gasPrice: gasPrice
		});
		await transactionModel.updateSuccess(transaction.hash, sellTransaction);

	} catch (e) {
		await transactionModel.updateFailedStatus(transaction.hash, e.message);
	}
}

async function getGetPrice() {
	const gasPrice = Number(await web3.eth.getGasPrice());
	const maxGasPrice = Number(await MyMiniMiners.methods.getGasFee().call());
	if (gasPrice > maxGasPrice) {
		console.error(new Error("gasPrice is bigger then  maxGasPrice"));
		return false;
	}
	return gasPrice;
}

handlePayForAppTransactionEvent();
handleBuyGameBundleEvent();
handleBuyEvent();
handleRemoveEvent();

async function manageTransactions() {

	const gasPrice = await getGetPrice();
	if (!gasPrice) {
		return;
	}
	const currentBlockNumber = await web3.eth.getBlockNumber();
	const currentBlockMinusConfirmsNeeded = currentBlockNumber - process.env.MIN_CONFIRMATIONS;
	const payedTransactions = await transactionModel.getNeedToProcessPayedTransactions(currentBlockMinusConfirmsNeeded);
	await processPayedTransactions(payedTransactions, gasPrice, TRANSACTION_TYPE.CLAIM, mint);
	await processPayedTransactions(payedTransactions, gasPrice, TRANSACTION_TYPE.SEll_GNOME, sell);
	const successTransactions = await transactionModel.getNeedToProcessSuccessTransactions(currentBlockMinusConfirmsNeeded);
	await processSuccessTransactions(successTransactions, TRANSACTION_TYPE.CLAIM, successMint);
	await processSuccessTransactions(successTransactions, TRANSACTION_TYPE.SEll_GNOME, successSell);
	await processSuccessTransactions(successTransactions, TRANSACTION_TYPE.BUY_BUNDLE, successBuyGameBundle);
	await processSuccessTransactions(successTransactions, TRANSACTION_TYPE.BUY, successBuy);
	await processSuccessTransactions(successTransactions, TRANSACTION_TYPE.REMOVE, successRemove);
	setTimeout(manageTransactions, 1000);
	//await handleSellTransactions(transactions);
}

exports.manageTransactions = manageTransactions;


