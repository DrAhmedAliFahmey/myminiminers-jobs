const Web3 = require("web3");
const fs = require("fs");
const path = require("path");
const gnomesModel = require("../../gnomes/model");
const gnomesListModel = require("../../gnomes_list/model");
const generalStorageModel = require("../model");
const {ZERO_ADDRESS, BLOCK_NUMBER} = require("../constants");
const {gnomeSchema} = require("../../gnomes/schemas/gnome.schema");
const {RARITIES_BY_INDEX} = require("../../gnomes/constants");
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.CHAIN_PROVIDER));

const MyMiniMinersTokenAbi = JSON.parse(fs.readFileSync(path.resolve("modules/blockchain_sync/abi/MyMiniMinersToken.json"), "utf8"));
const GnomesAbi = JSON.parse(fs.readFileSync(path.resolve("modules/blockchain_sync/abi/Gnomes.json"), "utf8"));
const CharacterAbi = JSON.parse(fs.readFileSync(path.resolve("modules/blockchain_sync/abi/Character.json"), "utf8"));

const MyMiniMinersTokenContract = new web3.eth.Contract(MyMiniMinersTokenAbi.abi, process.env.MYMINIMINERS_TOKEN_CONTART_ADDRESS);
const GnomesContract = new web3.eth.Contract(GnomesAbi.abi, process.env.GNOMES_CONTART_ADDRESS);
const CharacterContract = new web3.eth.Contract(CharacterAbi.abi, process.env.CHARACTER_CONTART_ADDRESS);


async function syncBlocks() {
	try {

		const waitingBlockToGetProcessed = await generalStorageModel.getWaitingBlockToGetProcessed(BLOCK_NUMBER.GNOMES_CONTRACT);
		const latestBlock = await web3.eth.getBlockNumber();
		const currentBlock = waitingBlockToGetProcessed;

		if (currentBlock > latestBlock - process.env.MIN_CONFIRMATIONS) {
			setTimeout(syncBlocks, 1000);
			return;
		}
		/*************************** handle events logic *******************************/

		const gnomesEvents = await GnomesContract.getPastEvents("allEvents", {
			fromBlock: waitingBlockToGetProcessed,
			toBlock: waitingBlockToGetProcessed
		});
		const gnomeEventsSorted = sortEvents(gnomesEvents);

		for (let i = 0; i < gnomeEventsSorted.length; i++) {
			// if blockNumber is null the block was removed
			if (!gnomeEventsSorted[i].blockNumber) {
				continue;
			}
			await handleMintEvent(gnomeEventsSorted[i]).catch(console.error);
			await handleBurnEvent(gnomeEventsSorted[i]);
			await handleGnomeTransferEvent(gnomeEventsSorted[i]);
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

