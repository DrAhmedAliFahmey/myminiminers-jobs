const {gnomeSchema} = require("../../../gnomes/schemas/gnome.schema");
const syncer = require("../sync_blocks");
const fs = require("fs");
const path = require("path");
const gnomesModel = require("../../../gnomes/model");
const gnomesListModel = require("../../../gnomes_list/model");
const {RARITIES_BY_INDEX} = require("../../../gnomes/constants");
const {ZERO_ADDRESS, CONTRACTS_NAMES} = require("../../constants");
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.CHAIN_PROVIDER));


const GnomesAbi = JSON.parse(fs.readFileSync(path.resolve("modules/blockchain_sync/abi/Gnomes.json"), "utf8"));

const GnomesContract = new web3.eth.Contract(GnomesAbi.abi, process.env.GNOMES_CONTART_ADDRESS);

exports.syncBlocks = function () {
	return syncer.syncBlocks(CONTRACTS_NAMES.GNOMES_CONTRACT, GnomesContract, eventsHandlerFunction);
};

async function eventsHandlerFunction(event) {
	await handleMintEvent(event);
	await handleBurnEvent(event);
	await handleGnomeTransferEvent(event);
}


async function handleMintEvent(event) {
	if (event.event !== "Mint") {
		return;
	}

	const gnomeTemplate = await gnomesListModel.getById(Number(event.returnValues.gnomeId));
	if (!gnomeTemplate) {
		return console.error("gnomeTemplate for id " + Number(event.returnValues.gnomeId) + " not found");
	}
	const power = await GnomesContract.methods.calcPower(event.returnValues.gnomeId, event.returnValues.level);
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
		in_collection: event.returnValues.inCollection,
		power: power,
		level: Number(event.returnValues.level),
		burned: false
	});
	if (error) {
		return console.error();
	}
	if (value.in_collection) {
		await gnomesModel.removeCurrentGnomeFromCollection(value.public_address, value.collection);
	}
	await gnomesModel.create(value);

}

async function handleBurnEvent(event) {

	if (event.event !== "Transfer" || event.returnValues.to !== ZERO_ADDRESS) {
		return;
	}
	return gnomesModel.changeTokenOwner({
		tokenId: Number(event.returnValues.tokenId),
		to: event.returnValues.to.toLowerCase(),
		burned: true
	});

}


async function handleGnomeTransferEvent(event) {

	if (event.event !== "Transfer" || event.returnValues.to === ZERO_ADDRESS || event.returnValues.from === ZERO_ADDRESS) {
		return;
	}
	const to = event.returnValues.to.toLowerCase();
	const tokenId = Number(event.returnValues.tokenId);
	const gnome = await gnomesModel.getGnomeByTokenId(tokenId);
	const inCollectionTokenId = Number(await GnomesContract.methods.getTokenIdByCollectionGnome(to, gnome.collection, tokenId));
	const inCollection = inCollectionTokenId === tokenId;
	await gnomesModel.changeTokenOwner({tokenId, to, inCollection});
}


// async function handleMintEventForTest(events) {
// 	const gnomesList = await gnomesListModel.get();
// 	const gnomes = [];
// 	events.forEach(event => {
// 		if (event.event !== "Mint") {
// 			return;
// 		}
// 		const gnomeTemplate = gnomesList.find(gnome => gnome.gnome_id.toString() === event.returnValues.gnomeId);
//
// 		const {error, value} = gnomeSchema.validate({
// 			token_id: Number(event.returnValues.tokenId),
// 			gnome_id: Number(event.returnValues.gnomeId),
// 			public_address: event.returnValues.player.toLowerCase(),
// 			created_at: new Date(),
// 			name: gnomeTemplate.name,
// 			full_name: `${gnomeTemplate.name} (★${event.returnValues.level}) #${event.returnValues.tokenId} `,
// 			description: gnomeTemplate.description,
// 			rarity: gnomeTemplate.rarity,
// 			rarity_index: RARITIES_BY_INDEX.indexOf(gnomeTemplate.rarity),
// 			collection: gnomeTemplate.collection,
// 			in_collection: false,
// 			level: Number(event.returnValues.level),
// 			burned: false
// 		});
// 		if (error) {
// 			return console.error();
// 		}
// 		gnomes.push(value);
// 	});
// 	return gnomesModel.createMany(gnomes);
//
// }
