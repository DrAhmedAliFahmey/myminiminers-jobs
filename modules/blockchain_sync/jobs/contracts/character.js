const syncer = require("../sync_blocks");
const fs = require("fs");
const path = require("path");
const characterModel = require("../../../character/model");
const {CONTRACTS_NAMES} = require("../../constants");
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.CHAIN_PROVIDER));


const CharacterAbi = JSON.parse(fs.readFileSync(path.resolve("modules/blockchain_sync/abi/Character.json"), "utf8"));

const CharacterContract = new web3.eth.Contract(CharacterAbi.abi, process.env.CHARACTER_CONTRACT_ADDRESS);

exports.syncBlocks = function () {
	return syncer.syncBlocks(CONTRACTS_NAMES.CHARACTER_CONTRACT, CharacterContract, eventsHandlerFunction);
};

async function eventsHandlerFunction(event) {
	await handleUpgradeEvent(event);
}


async function handleUpgradeEvent(event) {
	if (event.event !== "Upgrade") {
		return;
	}
	const account = event.returnValues.account.toLowerCase();
	const level = Number(event.returnValues.level);
	const power = Number(await CharacterContract.methods.getAccountPower(account));

	await characterModel.upsert(account, level, power);

}

