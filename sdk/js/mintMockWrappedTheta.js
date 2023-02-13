require('isomorphic-fetch');
const {BigNumber} = require("@ethersproject/bignumber");
const thetajs = require("@thetalabs/theta-js");
const {cfg} = require("./configs")
const {setCfg} = require("./configs")
const {createProvider, createWallet} = require("./common.js")

const MockWrappedThetaContract = require("../contracts/MockWrappedTheta.json")

async function mintMockWrappedTheta(chainIDStr, chainRPC, wrappedThetaContractAddr, receivingAddr, amount, minterKeyPath, minterKeyPassword) {
    const provider = createProvider(chainIDStr, chainRPC);
    const minterWallet = createWallet(provider, minterKeyPath, minterKeyPassword);
        
    let tntTokenContract, mintTx;
    tntTokenContract = new thetajs.Contract(wrappedThetaContractAddr, MockWrappedThetaContract.abi, minterWallet);
    mintTx = await tntTokenContract.mint(receivingAddr, amount);

    return mintTx;
}

async function mintMockWrappedThetaOnMainchain(receiverAddr, amount, minterKeyPath, minterKeyPassword) {
    let wrappedThetaContractAddr = cfg().wTHETAAddr;
    let mintTx = await mintMockWrappedTheta(cfg().mainchainIDStr, cfg().mainchainRPC, wrappedThetaContractAddr, receiverAddr, amount, minterKeyPath, minterKeyPassword);
    console.log("mintTx (on mainchain):", mintTx.hash);
}

//
// MAIN
//

//
// Privatenet examples (where the mainchain chainID is 366)
//
// Mainchain to Subchain Transfer:
//    node mintMockWrappedTheta.js privatenet 0x5CbDd86a2FA8Dc4bDdd8a8f69dBa48572EeC07FB 1000000000000000000 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
//

if (process.argv && process.argv.length != 7) {
    console.log("Usage:");
    console.log("  node mintMockWrappedTheta.js <networkType> <receiverAddr> <amountInWei> <senderKeyPath> [senderKeyPassword]");
    console.log("");
    process.exit(1);
}

let networkType = process.argv[2];
setCfg(networkType);

let receiverAddr = process.argv[3];
let amountInWei = BigNumber.from(process.argv[4]);
let minterKeyPath = process.argv[5];
let minterKeyPassword = process.argv[6];

mintMockWrappedThetaOnMainchain(receiverAddr, amountInWei, minterKeyPath, minterKeyPassword)
