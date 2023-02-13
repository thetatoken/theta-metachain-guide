require('isomorphic-fetch');
const {BigNumber} = require("@ethersproject/bignumber");
const {setCfg} = require("./configs")
const {transferTFuel} = require("./tfuelUtils")

//
// MAIN
//

//
// Privatenet examples (where the mainchain chainID is 366)
//
// Mainchain to Subchain Transfer:
//    node transferTFuel.js privatenet 360777 0x5CbDd86a2FA8Dc4bDdd8a8f69dBa48572EeC07FB 1000000000000000000 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
//
// Subchain to Mainchain Transfer:
//    node transferTFuel.js privatenet 366 0x5CbDd86a2FA8Dc4bDdd8a8f69dBa48572EeC07FB 1000000000000000000 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
//

//
// Testnet examples (where the mainchain chainID is 365)
//
// Mainchain to Subchain Transfer:
//    node transferTFuel.js testnet 360777 0x5CbDd86a2FA8Dc4bDdd8a8f69dBa48572EeC07FB 1000000000000000000 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
//
// Subchain to Mainchain Transfer:
//    node transferTFuel.js testnet 365 0x5CbDd86a2FA8Dc4bDdd8a8f69dBa48572EeC07FB 1000000000000000000 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
//

if (process.argv && process.argv.length != 8) {
    console.log("Usage:");
    console.log("  node transferTFuel.js <networkType> <targetChainID> <targetChainReceiver> <amountInWei> <senderKeyPath> [senderKeyPassword]");
    console.log("");
    process.exit(1);
}

let networkType = process.argv[2];
setCfg(networkType);

let targetChainID = process.argv[3];
let targetChainReceiver = process.argv[4];
let amountInWei = BigNumber.from(process.argv[5]);
let senderKeyPath = process.argv[6];
let senderKeyPassword = process.argv[7];

transferTFuel(senderKeyPath, senderKeyPassword, targetChainID, targetChainReceiver, amountInWei);
