require('isomorphic-fetch');
const {BigNumber} = require("@ethersproject/bignumber");
const {setCfg} = require("./configs")
const {TokenType, DontCare, getContextFromTargetChainID, getTokenBank, sleep} = require("./common.js")
const {mintMockTNTTokensIfNeeded} = require("./mintUtils")
const {approveTokenAccess, transferTNT} = require("./tntUtils")

async function transferTNT20(senderKeyPath, senderKeyPassword, sourceChainTokenOrVoucherContractAddr, targetChainID, targetChainReceiver, amount) {
    // Mint mock TNT tokens if sourceChainTokenOrVoucherContractAddr is not a voucher contract
    await mintMockTNTTokensIfNeeded(TokenType.TNT20, sourceChainTokenOrVoucherContractAddr, targetChainID, DontCare, amount, senderKeyPath, senderKeyPassword);

    // Approve the TokenBank contract as the spender of the TNT token
    let {sourceChainID, sourceChainIDStr, sourceChainRPC} = getContextFromTargetChainID(targetChainID);
    let spender = getTokenBank(TokenType.TNT20, sourceChainID, DontCare, DontCare);
    await approveTokenAccess(TokenType.TNT20, sourceChainIDStr, sourceChainRPC, sourceChainTokenOrVoucherContractAddr, spender.address, DontCare, amount, senderKeyPath, senderKeyPassword)

    // Transfer the tokens/vouchers
    await transferTNT(TokenType.TNT20, senderKeyPath, senderKeyPassword, sourceChainTokenOrVoucherContractAddr, targetChainID, targetChainReceiver, DontCare, amount);
}

//
// MAIN
//

//
// Privatenet examples (where the mainchain chainID is 366)
//
// Mainchain to Subchain Transfer (lock tokens on the mainchain):
//    node transferTNT20.js privatenet 0x4fb87c52Bb6D194f78cd4896E3e574028fedBAB9 360777 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 12345 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
//
// Subchain to Mainchain Transfer (burn vouchers on the subchain):
//    node transferTNT20.js privatenet 0x7D7e270b7E279C94b265A535CdbC00Eb62E6e68f 366 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 1111 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
//

//
// Testnet examples (where the mainchain chainID is 365)
//
// Mainchain to Subchain Transfer (lock tokens on the mainchain):
//    node transferTNT20.js testnet 0xC74c9a64d243bD2bc14C561E4D6B7DAAE19C73eA 360777 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 12345 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
//
// Subchain to Mainchain Transfer (burn vouchers on the subchain):
//    node transferTNT20.js testnet 0x7D7e270b7E279C94b265A535CdbC00Eb62E6e68f 365 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 1111 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
//

if (process.argv && process.argv.length != 9) {
    console.log("Usage:");
    console.log("  node transferTNT20.js <networkType> <sourceChainTokenOrVoucherContractAddr> <targetChainID> <targetChainReceiver> <amount> <senderKeyPath> [senderKeyPassword]");
    console.log("");
    process.exit(1);
}

let networkType = process.argv[2];
setCfg(networkType);

let sourceChainTokenOrVoucherContractAddr = process.argv[3];
let targetChainID = process.argv[4];
let targetChainReceiver = process.argv[5];
let amount = BigNumber.from(process.argv[6]);
let senderKeyPath = process.argv[7];
let senderKeyPassword = process.argv[8];

transferTNT20(senderKeyPath, senderKeyPassword, sourceChainTokenOrVoucherContractAddr, targetChainID, targetChainReceiver, amount);
