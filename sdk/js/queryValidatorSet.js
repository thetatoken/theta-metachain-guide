require('isomorphic-fetch');
const { BigNumber } = require("@ethersproject/bignumber");
const {setCfg, cfg} = require("./configs")
const thetajs = require("@thetalabs/theta-js");
const {ChainRegistrarOnMainchainContract, SubchainGovernanceTokenContract, DontCare, createProvider, createWallet, expandTo18Decimals, promptForWalletPassword, printValidatorSetForDynasty} = require("./common.js");

async function queryValidatorSet(dynasty) {
    const provider = createProvider(cfg().mainchainIDStr, cfg().mainchainRPC);
    const wallet = createWallet(provider);
    const chainRegistrarOnMainchainContract = new thetajs.Contract(cfg().registrarOnMainchainAddr, ChainRegistrarOnMainchainContract.abi, wallet)

    await printValidatorSetForDynasty(chainRegistrarOnMainchainContract, dynasty);
}

//
// MAIN
//

//
// Privatenet examples (where the mainchain chainID is 366)
//
// node queryValidatorSet.js privatenet 1

if (process.argv && !(process.argv.length >= 3)) {
    console.log("Usage:");
    console.log("  node queryValidatorSet.js <networkType> <dynasty>");
    console.log("");
    process.exit(1);
}

let networkType = process.argv[2];
setCfg(networkType);
let dynasty = BigNumber.from(process.argv[3]);

queryValidatorSet(dynasty)
