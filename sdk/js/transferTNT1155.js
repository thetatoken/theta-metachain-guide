require('isomorphic-fetch');
const {BigNumber} = require("@ethersproject/bignumber");
const {setCfg} = require("./configs")
const {TokenType, DontCare, getContextFromTargetChainID, getTokenBank} = require("./common.js")
const {mintMockTNTTokensIfNeeded} = require("./mintUtils")
const {approveTokenAccess, transferTNT} = require("./tntUtils")

async function transferTNT1155(senderKeyPath, senderKeyPassword, sourceChainTokenOrVoucherContractAddr, targetChainID, targetChainReceiver, tokenID) {
    // Mint mock TNT tokens if sourceChainTokenOrVoucherContractAddr is not a voucher contract
    await mintMockTNTTokensIfNeeded(TokenType.TNT1155, sourceChainTokenOrVoucherContractAddr, targetChainID, tokenID, amount, senderKeyPath, senderKeyPassword);

    // Approve the TokenBank contract as the spender of the TNT token
    let {sourceChainID, sourceChainIDStr, sourceChainRPC} = getContextFromTargetChainID(targetChainID);
    let spender = getTokenBank(TokenType.TNT1155, sourceChainID, DontCare, DontCare);
    await approveTokenAccess(TokenType.TNT1155, sourceChainIDStr, sourceChainRPC, sourceChainTokenOrVoucherContractAddr, spender.address, tokenID, amount, senderKeyPath, senderKeyPassword)

    // Transfer the tokens/vouchers
    await transferTNT(TokenType.TNT1155, senderKeyPath, senderKeyPassword, sourceChainTokenOrVoucherContractAddr, targetChainID, targetChainReceiver, tokenID, amount);
}

//
// MAIN
//

//
// Privatenet examples (where the mainchain chainID is 366)
//
// Mainchain to Subchain Transfer (lock tokens on the mainchain):
//    node transferTNT1155.js privatenet 0x47eb28D8139A188C5686EedE1E9D8EDE3Afdd543 360777 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 123 88888 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
//
// Subchain to Mainchain Transfer (burn vouchers on the subchain):
//    node transferTNT1155.js privatenet 0x0ede92cAc9161F6C397A604DE508Dcd1e6f43E61 366 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 123 1111 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
//

//
// Testnet examples (where the mainchain chainID is 365)
//
// Mainchain to Subchain Transfer (lock tokens on the mainchain):
//    node transferTNT1155.js testnet 0x9D2DAB964Eb49BDB944Bc91832123572b9a10619 360777 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 123 88888 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
//
// Subchain to Mainchain Transfer (burn vouchers on the subchain):
//    node transferTNT1155.js testnet 0x0ede92cAc9161F6C397A604DE508Dcd1e6f43E61 365 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 123 1111 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
//

if (process.argv && process.argv.length != 10) {
    console.log("Usage:");
    console.log("  node transferTNT1155.js <sourceChainTokenOrVoucherContract> <targetChainID> <targetChainReceiver> <tokenID> <amount> <senderKeyPath> [senderKeyPassword]");
    console.log("");
    process.exit(1);
}

let networkType = process.argv[2];
setCfg(networkType);

let sourceChainTokenOrVoucherContract = process.argv[3];
let targetChainID = process.argv[4];
let targetChainReceiver = process.argv[5];
let tokenID = BigNumber.from(process.argv[6]);
let amount = BigNumber.from(process.argv[7]);
let senderKeyPath = process.argv[8];
let senderKeyPassword = process.argv[9];

transferTNT1155(senderKeyPath, senderKeyPassword, sourceChainTokenOrVoucherContract, targetChainID, targetChainReceiver, tokenID, amount);
