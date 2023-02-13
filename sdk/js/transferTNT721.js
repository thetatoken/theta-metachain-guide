require('isomorphic-fetch');
const {BigNumber} = require("@ethersproject/bignumber");
const {setCfg} = require("./configs")
const {TokenType, DontCare, getContextFromTargetChainID, getTokenBank} = require("./common.js")
const {mintMockTNTTokensIfNeeded} = require("./mintUtils")
const {approveTokenAccess, transferTNT} = require("./tntUtils")

async function transferTNT721(senderKeyPath, senderKeyPassword, sourceChainTokenOrVoucherContractAddr, targetChainID, targetChainReceiver, tokenID) {
    // Mint mock TNT tokens if sourceChainTokenOrVoucherContractAddr is not a voucher contract
    await mintMockTNTTokensIfNeeded(TokenType.TNT721, sourceChainTokenOrVoucherContractAddr, targetChainID, tokenID, DontCare, senderKeyPath, senderKeyPassword);

    // Approve the TokenBank contract as the spender of the TNT token
    let {sourceChainID, sourceChainIDStr, sourceChainRPC} = getContextFromTargetChainID(targetChainID);
    let spender = getTokenBank(TokenType.TNT721, sourceChainID, DontCare, DontCare);
    await approveTokenAccess(TokenType.TNT721, sourceChainIDStr, sourceChainRPC, sourceChainTokenOrVoucherContractAddr, spender.address, tokenID, DontCare, senderKeyPath, senderKeyPassword)

    // Transfer the tokens/vouchers
    await transferTNT(TokenType.TNT721, senderKeyPath, senderKeyPassword, sourceChainTokenOrVoucherContractAddr, targetChainID, targetChainReceiver, tokenID, DontCare);
}

//
// MAIN
//

//
// Privatenet examples (where the mainchain chainID is 366)
//
// Mainchain to Subchain Transfer (lock tokens on the mainchain):
//    node transferTNT721.js privatenet 0xEd8d61f42dC1E56aE992D333A4992C3796b22A74 360777 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 666 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
//
// Subchain to Mainchain Transfer (burn vouchers on the subchain):
//    node transferTNT721.js privatenet 0xd5125d7bB9c4Fb222C522c4b1922cabC631E52D7 366 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 666 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
//

//
// Testnet examples (where the mainchain chainID is 365)
//
// Mainchain to Subchain Transfer (lock tokens on the mainchain):
//    node transferTNT721.js testnet 0x166f67eDad98c3382323e7E8E64C8dD24d9C29a7 360777 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 666 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
//
// Subchain to Mainchain Transfer (burn vouchers on the subchain):
//    node transferTNT721.js testnet 0xd5125d7bB9c4Fb222C522c4b1922cabC631E52D7 365 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 666 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
//

if (process.argv && process.argv.length != 9) {
    console.log("Usage:");
    console.log("  node transferTNT721.js <sourceChainTokenOrVoucherContractAddr> <targetChainID> <targetChainReceiver> <tokenID> <senderKeyPath> [senderKeyPassword]");
    console.log("");
    process.exit(1);
}

let networkType = process.argv[2];
setCfg(networkType);

let sourceChainTokenOrVoucherContractAddr = process.argv[3];
let targetChainID = process.argv[4];
let targetChainReceiver = process.argv[5];
let tokenID = BigNumber.from(process.argv[6]);
let senderKeyPath = process.argv[7];
let senderKeyPassword = process.argv[8];

transferTNT721(senderKeyPath, senderKeyPassword, sourceChainTokenOrVoucherContractAddr, targetChainID, targetChainReceiver, tokenID);
