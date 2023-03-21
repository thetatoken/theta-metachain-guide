require('isomorphic-fetch');
const {setCfg, cfg} = require("./configs")
const thetajs = require("@thetalabs/theta-js");
const {ChainRegistrarOnMainchainContract, SubchainGovernanceTokenContract, createProvider, createWallet, expandTo18Decimals, promptForWalletPassword} = require("./common.js")

async function printGovTokenDetails(subchainGovToken) {
    console.log("------ Subchain Governance Token Details ------")
    console.log("Address  :", subchainGovToken.address)
    console.log("Name     :", await subchainGovToken.name())
    console.log("Symbol   :", await subchainGovToken.symbol())
    console.log("Decimals :", await subchainGovToken.decimals())
    console.log("StakerRewardPerBlock :", (await subchainGovToken.stakerRewardPerBlock()).toString())
    console.log("-----------------------------------------------")
}

async function sendSubchainGovernanceToken(govTokenContractAddress, amountInWei, receiverAddr, senderKeyPath, password) {
    if (!password) {
        password = await promptForWalletPassword();
    }
    
    const provider = createProvider(cfg().mainchainIDStr, cfg().mainchainRPC);
    const wallet = createWallet(provider, senderKeyPath, password);

    const chainRegistrarOnMainchainContract = new thetajs.Contract(cfg().registrarOnMainchainAddr, ChainRegistrarOnMainchainContract.abi, wallet)
    const {dynasty} = await chainRegistrarOnMainchainContract.getDynasty();
    const subchainGovToken = new thetajs.Contract(govTokenContractAddress, SubchainGovernanceTokenContract.abi, wallet);

    console.log('');
    console.log('Sender address   :', wallet.address);
    console.log('Receiver address :', receiverAddr);
    console.log('Amount sent (Wei):', amountInWei);
    console.log('Dynasty          :', dynasty.toString());
    console.log('')
    await printGovTokenDetails(subchainGovToken)
    console.log('')
    

    console.log(`Before sending, sender's balance: ${await subchainGovToken.balanceOf(wallet.getAddress())}, receiver's balance: ${await subchainGovToken.balanceOf(receiverAddr)}`)
    let sendTx = await subchainGovToken.transfer(receiverAddr, amountInWei)
    console.log("sendTx:", sendTx.hash)
    console.log(`After  sending, sender's balance: ${await subchainGovToken.balanceOf(wallet.getAddress())}, receiver's balance: ${await subchainGovToken.balanceOf(receiverAddr)}`)
}

//
// MAIN
//

//
// Privatenet examples (where the mainchain chainID is 366)
//
// node sendGovToken.js privatenet 1000000000 0x490ae30F584E778Fb5FbcAb6aC650692aaa45FbE ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop

//
// Testnet examples (where the mainchain chainID is 365)
//
// node sendGovToken.js testnet 1000000000 0x490ae30F584E778Fb5FbcAb6aC650692aaa45FbE ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop

if (process.argv && !(process.argv.length == 7)) {
    console.log("Usage:");
    console.log("  node deployGovToken.js <networkType> <govTokenContractAddress> <amountInWei> <receiverAddr> <senderKeyPath> [password]");
    console.log("");
    process.exit(1);
}

let networkType = process.argv[2];
setCfg(networkType);

let govTokenContractAddress = cfg().govTokenContractAddr;
let amountInWei = process.argv[3];
let receiverAddr = process.argv[4];
let senderKeyPath = process.argv[5];

let password = null
if (process.argv.length == 7) {
    password = process.argv[6];
}

sendSubchainGovernanceToken(govTokenContractAddress, amountInWei, receiverAddr, senderKeyPath, password)
