const Web3 = require("web3");
const fs = require("fs");
const path = require("path");
const userModel = require("../../user/model");
const gnomesModel = require("../../gnomes/model");
const gnomesListModel = require("../../gnomes_list/model");
const generalStorageModel = require("../model");
const usersActions = require("../../user/actions");
const {ZERO_ADDRESS, CONFIRMATIONS} = require("../constants");
const {gnomeSchema} = require("../../gnomes/schemas/gnome.schema");
const {COLLECTION_BY_INDEX} = require("../../gnomes/constants");
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.CHAIN_PROVIDER));

const MyMiniMinersAbi = JSON.parse(fs.readFileSync(path.resolve("modules/blockchain_sync/MyMiniMiners.json"), "utf8"));

const MyMiniMinersContract = new web3.eth.Contract(MyMiniMinersAbi.abi, process.env.MYMINIMINERS_CONTART_ADDRESS);
const ROMAN_NUMBERS_BY_INDEX = [
	"I",
	"II",
	"III",
	"IV",
	"V",
	"VI",
	"VII",
	"VIII",
	"IX",
	"X"
];

async function syncBlocks() {
	try {


		const waitingBlockToGetProcessed = await generalStorageModel.getWaitingBlockToGetProcessed();
		const latestBlock = await web3.eth.getBlockNumber();
		const nextBlock = waitingBlockToGetProcessed + 1;

		if (nextBlock >= latestBlock - CONFIRMATIONS) {
			setTimeout(syncBlocks, 1000);
			return;
		}
		/*************************** handle events logic *******************************/

		const myMiniMinersEvents = await MyMiniMinersContract.getPastEvents("allEvents", {
			fromBlock: waitingBlockToGetProcessed,
			toBlock: waitingBlockToGetProcessed
		});
		const myMiniMinersEventsSorted = sortEvents(myMiniMinersEvents);
		for (let i = 0; i < myMiniMinersEventsSorted.length; i++) {
			// if blockNumber is null the block was removed
			if (!myMiniMinersEventsSorted[i].blockNumber) {
				continue;
			}
			await createNewPlayerIfNotExists(myMiniMinersEventsSorted[i]);
			await handleMintEvent(myMiniMinersEventsSorted[i]);
			await handleBurnEvent(myMiniMinersEventsSorted[i]);
			await handleGnomeTransferEvent(myMiniMinersEventsSorted[i]);
			await handleCollectionChangeEvent(myMiniMinersEventsSorted[i]);
			await handlePowerChangeEvent(myMiniMinersEventsSorted[i]);
		}
		/********************************* end *****************************************/
		await generalStorageModel.updateWaitingBlockToGetProcessed(nextBlock);
	} catch (e) {
		console.error(e);
	}
	setTimeout(syncBlocks, 0);
}

exports.syncBlocks = syncBlocks;


function sortEvents(events) {
	const eventsDup = [...events];
	eventsDup.sort((l, r) => (l.transactionIndex - r.transactionIndex || l.logIndex - r.logIndex));
	return eventsDup;
}

async function createNewPlayerIfNotExists(event) {

	if (event.event !== "Transfer") {
		return;
	}
	const user = await userModel.getUserByAddress(event.returnValues.to);
	if (user) {
		return;
	}
	const payload = {public_address: event.returnValues.to, ...usersActions.getNewUserDefaultValues()};
	const nweUser = usersActions.validateRegistration(payload);
	return userModel.createUser(nweUser);
}

async function handleMintEvent(event) {

	if (event.event !== "Mint") {
		return;
	}
	const gnomeTemplate = await gnomesListModel.getById(Number(event.returnValues.gnomeId));
	if (gnomeTemplate) {
		console.error("gnomeTemplate for id" + Number(event.returnValues.gnomeId) + " not found");
		return;

	}
	const {error, value} = gnomeSchema.validate({
		token_id: Number(event.returnValues.tokenId),
		gnome_id: Number(event.returnValues.gnomeId),
		public_address: event.returnValues.player,
		created_at: new Date(),
		name: gnomeTemplate.name,
		full_name: gnomeTemplate.name + " The " + ROMAN_NUMBERS_BY_INDEX[Number(event.returnValues.level) - 1],
		description: gnomeTemplate.description,
		image: gnomeTemplate.name + "/" + Number(event.returnValues.level),
		rarity: gnomeTemplate.rarity,
		collection: gnomeTemplate.collection,
		in_collection: false,
		level: Number(event.returnValues.level)
	});
	if (error) {
		console.error();
	}
	return gnomesModel.create(value);
}

async function handleBurnEvent(event) {

	if (event.event !== "Transfer" || event.returnValues.to !== ZERO_ADDRESS) {
		return;
	}
	return gnomesModel.deleteGnomeByTokenId(event.returnValues.tokenId);

}

async function handleCollectionChangeEvent(event) {

	if (event.event !== "CollectionChange") {
		return;
	}

	gnomesModel.changeInCollection(event.returnValues.oldTokenId, event.returnValues.newTokenId);
}

async function handlePowerChangeEvent(event) {

	if (event.event !== "PowerChange") {
		return;
	}

	userModel.updatePower(event.returnValues.player, COLLECTION_BY_INDEX[event.returnValues.collection], event.returnValues.collectionPower, event.returnValues.playerPower);
}


async function handleGnomeTransferEvent(event) {

	if (event.event !== "Transfer" || event.returnValues.to === ZERO_ADDRESS || event.returnValues.from === ZERO_ADDRESS) {
		return;
	}

	return gnomesModel.changeTokenOwner(event.returnValues.tokenId, event.returnValues.to);
}

// async function addEvent(name, fromBlock) {
//
// 	MyMiniMiners.events[name]({fromBlock}, function (error, event) {
// 		if (error) {
// 			console.error(error);
// 			return process.exit(1);
// 		}
// 		if (event.removed === true) {
// 			//todo
// 			//handle rejected transaction
// 			return;
// 		}
// 		const validationResult = transactionsActions.validate({
// 			transaction_block_number: event.blockNumber,
// 			transaction_hash: event.transactionHash,
// 			transaction_index: event.transactionIndex,
// 			log_index: event.logIndex,
// 			event_name: name,
// 			returnValues: event.returnValues,
// 			status: TRANSACTION_STATUS.MINED
// 		});
// 		if (validationResult.error) {
// 			return console.error(validationResult.error);
// 		}
// 		transactionModel.create(validationResult.value).catch(console.error);
// 	});
// }
