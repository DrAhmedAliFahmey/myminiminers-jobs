const syncer = require("../sync_blocks");
const fs = require("fs");
const path = require("path");
const {CONTRACTS_NAMES} = require("../../constants");
const Web3 = require("web3");
const minesModel = require("../../../mines/model");
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.CHAIN_PROVIDER));

const MinesAbi = JSON.parse(fs.readFileSync(path.resolve("modules/blockchain_sync/abi/Mines.json"), "utf8"));

const MinesContract = new web3.eth.Contract(MinesAbi.abi, process.env.MINES_CONTRACT_ADDRESS);

exports.syncBlocks = function () {
	return syncer.syncBlocks(CONTRACTS_NAMES.MINES_CONTRACT, MinesContract, eventsHandlerFunction);
};

async function eventsHandlerFunction(event) {
	await handleMineCreatedEvent(event);
	await handleClaimEvent(event);
	await handleMineEvent(event);
}


async function handleMineEvent(event) {
	if (event.event !== "Mine") {
		return;
	}
	const account = event.returnValues.account.toLowerCase();
	const mineId = Number(event.returnValues.mineId);
	const collectionId = Number(event.returnValues.mineId);
	const startTime = Number(event.returnValues.timestamp);
	return minesModel.addPlayerFromMine(account, mineId, collectionId, startTime);

}

async function handleClaimEvent(event) {
	if (event.event !== "Claim") {
		return;
	}
	const account = event.returnValues.account.toLowerCase();
	const mineId = Number(event.returnValues.mineId);
	return minesModel.removePlayerFromMine(account, mineId);


}

async function handleMineCreatedEvent(event) {
	if (event.event !== "MineCreated") {
		return;
	}
	const mineId = Number(event.returnValues.mineId);
	const mine = await MinesContract.methods.getMine(mineId);

	await minesModel.create({
		id: mineId,
		power_multi: Number(mine.powerMulti), // multiple the power difference in a fight
		miner: {
			collection_id: Number(mine.miner.collection_id),
			start_time: Number(mine.miner.startTime),
			address: mine.miner.address.toLowerCase(),
		},
		min_power: Number(mine.minPower),
		max_power: Number(mine.maxPower),
		production_rate: Number(mine.productionRate),
	});

}
