const Web3 = require("web3");
const fs = require("fs");
const path = require("path");
const gnomesModel = require("../../gnomes/model");
const gnomesListModel = require("../../gnomes_list/model");
const generalStorageModel = require("../model");
const {ZERO_ADDRESS} = require("../constants");
const {gnomeSchema} = require("../../gnomes/schemas/gnome.schema");
const {RARITIES_BY_INDEX} = require("../../gnomes/constants");
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.CHAIN_PROVIDER));

const MyMiniMinersAbi = JSON.parse(fs.readFileSync(path.resolve("modules/blockchain_sync/abi/MyMiniMiners.json"), "utf8"));

const MyMiniMinersContract = new web3.eth.Contract(MyMiniMinersAbi.abi, process.env.MYMINIMINERS_CONTART_ADDRESS);


async function syncBlocks() {
	try {

		const waitingBlockToGetProcessed = await generalStorageModel.getWaitingBlockToGetProcessed();
		const latestBlock = await web3.eth.getBlockNumber();
		const currentBlock = waitingBlockToGetProcessed;

		if (currentBlock > latestBlock - process.env.MIN_CONFIRMATIONS) {
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
			await handleMintEvent(myMiniMinersEventsSorted[i]).catch(console.error);
			await handleBurnEvent(myMiniMinersEventsSorted[i]);
			await handleGnomeTransferEvent(myMiniMinersEventsSorted[i]);
		}
		/********************************* end *****************************************/
		await generalStorageModel.updateWaitingBlockToGetProcessed(currentBlock + 1);
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

async function handleMintEventForTest(events) {
	const gnomesList = await gnomesListModel.get();
	const gnomes = [];
	events.forEach(event => {
		if (event.event !== "Mint") {
			return;
		}
		const gnomeTemplate = gnomesList.find(gnome => gnome.gnome_id.toString() === event.returnValues.gnomeId);

		const {error, value} = gnomeSchema.validate({
			token_id: Number(event.returnValues.tokenId),
			gnome_id: Number(event.returnValues.gnomeId),
			public_address: event.returnValues.player.toLowerCase(),
			created_at: new Date(),
			name: gnomeTemplate.name,
			full_name: `${gnomeTemplate.name} (★${event.returnValues.level}) #${event.returnValues.tokenId} `,
			description: gnomeTemplate.description,
			rarity: gnomeTemplate.rarity,
			rarity_index: RARITIES_BY_INDEX.indexOf(gnomeTemplate.rarity),
			collection: gnomeTemplate.collection,
			in_collection: false,
			level: Number(event.returnValues.level),
			burned: false
		});
		if (error) {
			return console.error();
		}
		gnomes.push(value);
	});
	return gnomesModel.createMany(gnomes);

}

async function handleMintEvent(event) {
	if (event.event !== "Mint") {
		return;
	}

	const gnomeTemplate = await gnomesListModel.getById(Number(event.returnValues.gnomeId));
	if (!gnomeTemplate) {
		return console.error("gnomeTemplate for id " + Number(event.returnValues.gnomeId) + " not found");
	}
	const {error, value} = gnomeSchema.validate({
		token_id: Number(event.returnValues.tokenId),
		gnome_id: Number(event.returnValues.gnomeId),
		public_address: event.returnValues.player.toLowerCase(),
		created_at: new Date(),
		name: gnomeTemplate.name,
		full_name: `${gnomeTemplate.name} (★${event.returnValues.level}) #${event.returnValues.tokenId} `,
		description: gnomeTemplate.description,
		rarity: gnomeTemplate.rarity,
		rarity_index: RARITIES_BY_INDEX.indexOf(gnomeTemplate.rarity),
		collection: gnomeTemplate.collection,
		in_collection: false,
		level: Number(event.returnValues.level),
		burned: false
	});
	if (error) {
		return console.error();
	}
	await gnomesModel.create(value);
	return gnomesModel.setHighestGnomeInCollection(event.returnValues.player.toLowerCase(), gnomeTemplate.gnome_id);
}

async function handleBurnEvent(event) {

	if (event.event !== "Transfer" || event.returnValues.to !== ZERO_ADDRESS) {
		return;
	}
	return gnomesModel.changeTokenOwner(Number(event.returnValues.tokenId), event.returnValues.to.toLowerCase(), true);

}


async function handleGnomeTransferEvent(event) {

	if (event.event !== "Transfer" || event.returnValues.to === ZERO_ADDRESS || event.returnValues.from === ZERO_ADDRESS) {
		return;
	}

	await gnomesModel.changeTokenOwner(Number(event.returnValues.tokenId), event.returnValues.to.toLowerCase());
	const gnome = await gnomesModel.getGnomeByTokenId(Number(event.returnValues.tokenId));
	return gnomesModel.setHighestGnomeInCollection(event.returnValues.to.toLowerCase(), gnome.gnome_id);

}

