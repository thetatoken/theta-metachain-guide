require('isomorphic-fetch');
const {setCfg, cfg} = require("./configs")
const thetajs = require("@thetalabs/theta-js");
const {ChainRegistrarOnMainchainContract, TNT20TokenInterface, createProvider, createWallet, expandTo18Decimals, promptForWalletPassword} = require("./common.js")

async function printAllRegisteredSubchains(chainRegistrarOnMainchainContract) {
    let registeredChainIDs = await chainRegistrarOnMainchainContract.getAllSubchainIDs()
    console.log("All registered subchains:")
    let numRegisteredSubchains = registeredChainIDs.length
    for (i = 0; i < numRegisteredSubchains; i ++) {
        let subchainID = registeredChainIDs[i];
        let subchainMetadata = await chainRegistrarOnMainchainContract.getSubchainMetadata(subchainID)
        console.log(`Subchain, ID: ${subchainID.toString()}, metadata: ${subchainMetadata}`)
    }

}

async function registerSubchain(genesisHash, keyPath, password) {
    if (!password) {
        password = await promptForWalletPassword();
    }
    
    const provider = createProvider(cfg().mainchainIDStr, cfg().mainchainRPC);
    const wallet = createWallet(provider, keyPath, password);

    const wThetaContract = new thetajs.Contract(cfg().wTHETAAddr, TNT20TokenInterface.abi, wallet)
    const chainRegistrarOnMainchainContract = new thetajs.Contract(cfg().registrarOnMainchainAddr, ChainRegistrarOnMainchainContract.abi, wallet)
    const {dynasty} = await chainRegistrarOnMainchainContract.getDynasty();

    console.log('');
    console.log('Wallet address    :', wallet.address);
    console.log('Registrar address :', chainRegistrarOnMainchainContract.address);
    console.log('Dynasty           :', dynasty.toString());
    console.log('');

    let subchainCollateral = expandTo18Decimals(10000) // 10000 wTHETA
    console.log('Approve', subchainCollateral.toString(), 'wTHETA spendable by Registrar', chainRegistrarOnMainchainContract.address);
    await wThetaContract.approve(chainRegistrarOnMainchainContract.address, subchainCollateral);

    console.log("")
    await printAllRegisteredSubchains(chainRegistrarOnMainchainContract)
    console.log("")

    let registerTx = await chainRegistrarOnMainchainContract.registerSubchain(cfg().subchainID, cfg().govTokenContractAddr, subchainCollateral, genesisHash)
    console.log("Registering suchain", cfg().subchainID)
    console.log("Subchain registration tx: ", registerTx.hash);
    console.log("")

    await printAllRegisteredSubchains(chainRegistrarOnMainchainContract)
    console.log("")
}

//
// MAIN
//

//
// Privatenet examples (where the mainchain chainID is 366)
//
// node registerSubchain.js privatenet <genesisHash> ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop

//
// Testnet examples (where the mainchain chainID is 365)
//
// node registerSubchain.js testnet <genesisHash> ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab

if (process.argv && !(process.argv.length == 5 || process.argv.length == 6)) {
    console.log("Usage:");
    console.log("  node registerSubchain.js <networkType> <genesisHash> <stakerKeyPath> [password]");
    console.log("");
    process.exit(1);
}

let networkType = process.argv[2];
setCfg(networkType);

let genesisHash = process.argv[3];
let keyPath = process.argv[4];

let password = null
if (process.argv.length == 6) {
    password = process.argv[5];
}

registerSubchain(genesisHash, keyPath, password)
