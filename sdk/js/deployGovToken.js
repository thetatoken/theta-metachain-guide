require('isomorphic-fetch');
const {setCfg, cfg} = require("./configs")
const thetajs = require("@thetalabs/theta-js");
const {ChainRegistrarOnMainchainContract, SubchainGovernanceTokenContract, createProvider, createWallet, expandTo18Decimals, promptForWalletPassword} = require("./common.js")

async function printGovTokenDetails(subchainGovToken, initDistrWallet) {
    console.log("------ Subchain Governance Token Details ------")
    console.log("Address  :", subchainGovToken.address)
    console.log("Name     :", await subchainGovToken.name())
    console.log("Symbol   :", await subchainGovToken.symbol())
    console.log("Decimals :", await subchainGovToken.decimals())
    console.log("StakerRewardPerBlock :", (await subchainGovToken.stakerRewardPerBlock()).toString())
    console.log("Init distr wallet    :", initDistrWallet)
    console.log("Balance of init distr wallet:", (await subchainGovToken.balanceOf(initDistrWallet)).toString())
    console.log("-----------------------------------------------")
}

async function deploySubchainGovernanceToken(name, symbol, initDistrWallet, admin, deployerKeyPath, password) {
    if (!password) {
        password = await promptForWalletPassword();
    }
    
    const provider = createProvider(cfg().mainchainIDStr, cfg().mainchainRPC);
    const wallet = createWallet(provider, deployerKeyPath, password);

    const chainRegistrarOnMainchainContract = new thetajs.Contract(cfg().registrarOnMainchainAddr, ChainRegistrarOnMainchainContract.abi, wallet)
    const validatorStakeManagerAddr = await chainRegistrarOnMainchainContract.vsm()
    const {dynasty} = await chainRegistrarOnMainchainContract.getDynasty();

    console.log('');
    console.log('Deployer address  :', wallet.address);
    console.log('Registrar address :', chainRegistrarOnMainchainContract.address);
    console.log('Dynasty           :', dynasty.toString());
    console.log('');

    const decimals = 18;
    maxSupply = expandTo18Decimals(1000000000); // 1 Billion
    initMintAmount = expandTo18Decimals(500000000); // 500 Million
    stakerRewardPerBlock = expandTo18Decimals(2); // 2 tokens per block, the issuance will last for approximately 49 years
    const minter = validatorStakeManagerAddr;

    const contractToDeploy = new thetajs.ContractFactory(SubchainGovernanceTokenContract.abi, SubchainGovernanceTokenContract.bytecode, wallet);
    let result = await contractToDeploy.deploy(name, symbol, decimals, maxSupply, minter, stakerRewardPerBlock, initDistrWallet, initMintAmount, admin);
    const contractAddress = result.contract_address;
    console.log("tx hash", result.hash)
    console.log("contract address", contractAddress)

    const subchainGovToken = new thetajs.Contract(contractAddress, SubchainGovernanceTokenContract.abi, wallet);

    // subchainGovToken = await SubchainGovernanceTokenContract.new(
    //     name, symbol, decimals, maxSupply,
    //     minter, stakerRewardPerBlock, initDistrWallet, initMintAmount, admin)

    console.log("")
    await printGovTokenDetails(subchainGovToken, initDistrWallet)
    console.log("")
}

//
// MAIN
//

//
// Privatenet examples (where the mainchain chainID is 366)
//
// node deployGovToken.js privatenet "Subchain 360777 Gov" SNDGOV 0x11Ac5dCCEa0603a24E10B6f017C7c3285D46CE8e 0x11Ac5dCCEa0603a24E10B6f017C7c3285D46CE8e ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop

//
// Testnet examples (where the mainchain chainID is 365)
//
// node deployGovToken.js testnet "Subchain 360777 Gov" SNDGOV 0x11Ac5dCCEa0603a24E10B6f017C7c3285D46CE8e 0x11Ac5dCCEa0603a24E10B6f017C7c3285D46CE8e ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab

if (process.argv && !(process.argv.length == 8 || process.argv.length == 9)) {
    console.log("Usage:");
    console.log("  node deployGovToken.js <networkType> <tokenName> <tokenSymbol> <initDistrWallet> <admin> <deployerKeyPath> [password]");
    console.log("");
    process.exit(1);
}

let networkType = process.argv[2];
setCfg(networkType);

let tokenName = process.argv[3];
let tokenSymbol = process.argv[4];
let initDistrWallet = process.argv[5];
let admin =  process.argv[6];
let deployerKeyPath = process.argv[7];

let password = null
if (process.argv.length == 9) {
    password = process.argv[8];
}

deploySubchainGovernanceToken(tokenName, tokenSymbol, initDistrWallet, admin, deployerKeyPath, password)
