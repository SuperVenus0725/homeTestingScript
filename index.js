import dotenv from "dotenv";
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from "node:constants";
dotenv.config();
import * as readline from 'node:readline';
import { promisify } from 'util';
import { terraClient } from './constants.js';

import { LocalTerra, LCDClient, Dec, Int, MsgWithdrawDelegatorReward } from "@terra-money/terra.js";
import { MnemonicKey } from '@terra-money/terra.js';
import {
  executeContract, getGasUsed, instantiateContract, queryContract, readArtifact, storeCode,
  writeArtifact, queryBankUusd, queryContractInfo, readDistantArtifact,
  queryTokenBalance
} from './utils.js';

export const contractPath = "./home_coding_testing.wasm"

export const terraTestnetClient = new LCDClient({
  URL: 'https://bombay-lcd.terra.dev',
  chainID: 'bombay-12',
});

terraTestnetClient.chainID = "bombay-12";
export const localTerraClient = new LocalTerra();
localTerraClient.chainID = "localterra";

const mk1 = new MnemonicKey({
  mnemonic: "shallow squeeze where genre spawn beauty cake example gaze excess style essence enlist play panel defense lamp exchange churn wink category sound pair glance",
});
export const testing_wallet = terraClient.wallet(mk1);

const mk2 = new MnemonicKey({
  mnemonic: "slot hour report material use nominee shed future industry point rapid swear magic sell salute media inherit detail kind disagree bus jungle scene noodle",
});
export const admin_wallet = terraClient.wallet(mk2);

const mk3 = new MnemonicKey({
  mnemonic: "slight rent rigid brand kitchen treat detect final phrase worry lunar situate salmon pepper what attract happy quantum brain inhale unable host grain basket",
});
export const user1 = terraClient.wallet(mk3);

const mk4 = new MnemonicKey({
  mnemonic: "life install regular episode boy better rather early middle lazy chief scan age dove all summer fog armed jungle surround mansion mountain cycle author",
});
export const user2 = terraClient.wallet(mk4);


async function uploadContract() {
  console.log("Uploading Contract...");
  let contractId = await storeCode(testing_wallet, contractPath); // Getting the contract id from local terra
  console.log(`Contract ID: ${contractId}`);
  return contractId;
}

async function instantiateHomeContract(tokenId, contractAddress) {

  console.log("Instantiating Token Contract...");

  let initMessage = {
    owner: user1.key.accAddress
  }

  console.log(JSON.stringify(initMessage, null, 2));
  let result = await instantiateContract(testing_wallet, tokenId, initMessage);
  let contractAddresses = result.logs[0].events[0].attributes.filter(element => element.key == 'contract_address').map(x => x.value);
  console.log(`Token Contract Address: ${contractAddresses}`);
  return contractAddresses;
}

async function savePointer(contractAddress, address, token_type, pointer) {

  let savePointer = {
    set_pointer: { address: address, token_type: token_type, pointer: pointer }
  };

  console.log(JSON.stringify(savePointer, null, 2));

  let wsfacResponse = await executeContract(user1, contractAddress, savePointer);
  console.log("transaction hash = " + wsfacResponse['txhash']);
}


async function getStateInfo(contractAddress) {
  let coResponse = await queryContract(contractAddress, {
    get_state_info: {}
  });
  console.log(coResponse);
  return coResponse;
}

async function getPointer(contractAddress, address, token_type) {
  let coResponse = await queryContract(contractAddress, {
    get_pointer: {
      address: address,
      token_type: token_type
    }
  });
  console.log(coResponse);
  return coResponse;
}






async function main() {

  const codeId = 71342;
  const contractAddress = "terra1ruek2fvvajnq00tqt73tyv44dvwjawv25430dg";
  //uploading contract
  //const codeId = await uploadContract();


  //Instantiating contract
  //let contractAddress = await instantiateHomeContract(codeId);

  await savePointer(contractAddress, user2.key.accAddress, "luna", "100");
  await getStateInfo(contractAddress);
  await getPointer(contractAddress, user2.key.accAddress, "luna");

}

main();