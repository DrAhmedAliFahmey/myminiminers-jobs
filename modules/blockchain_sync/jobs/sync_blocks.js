const Web3 = require("web3");

const generalStorageModel = require("../model");

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.CHAIN_PROVIDER));


async function syncBlocks(contractName,contract, eventsHandlerFunction) {
	try {

		const waitingBlockToGetProcessed = await generalStorageModel.getWaitingBlockToGetProcessed(contractName);
		const latestBlock = await web3.eth.getBlockNumber();
		const currentBlock = waitingBlockToGetProcessed;

		if (currentBlock > latestBlock - process.env.MIN_CONFIRMATIONS) {
			setTimeout(syncBlocks, 1000);
			return;
		}
		/*************************** handle events logic *******************************/

		const contractEvents = await contract.getPastEvents("allEvents", {
			fromBlock: waitingBlockToGetProcessed,
			toBlock: waitingBlockToGetProcessed
		});
		const contractEventsSorted = sortEvents(contractEvents);

		for (let i = 0; i < contractEventsSorted.length; i++) {
			// if blockNumber is null the block was removed
			if (!contractEventsSorted[i].blockNumber) {
				continue;
			}
			await eventsHandlerFunction(contractEventsSorted[i]);

		}
		/********************************* end *****************************************/
		await generalStorageModel.updateWaitingBlockToGetProcessed(contractName, currentBlock + 1);
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
