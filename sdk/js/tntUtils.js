
const thetajs = require("@thetalabs/theta-js");
const {BigNumber} = require("@ethersproject/bignumber");
const {cfg} = require("./configs.js")

const {TNT20TokenBankContract, TNT721TokenBankContract, TNT1155TokenBankContract, TokenType, DontCare, 
    createProvider, createWallet, getWallet, getContextFromTargetChainID, printSenderReceiverBalances, 
    detectTargetChainReceiverBalanceChanges, expandTo18Decimals, buildDenom, extractOriginChainIDFromDenom, 
    extractContractAddressFromDenom} = require("./common.js")

const MockTNT20Contract = require("../contracts/MockTNT20.json")
const MockTNT721Contract = require("../contracts/MockTNT721.json")
const MockTNT1155Contract = require("../contracts/MockTNT1155.json")

// Note: a voucher is also a TNT token itself, so we can use the following function to retrieve
//       the voucher balance of an address
async function getTNTTokenBalance(tokenType, chainIDStr, rpc, tokenContractAddress, tokenID, queriedAddress) {
    const provider = createProvider(chainIDStr, rpc);
    const wallet = createWallet(provider);
    if (tokenContractAddress == 0x0) { // in case the token or voucher contract does not exist yet
        return BigNumber.from(0);
    }

    let tokenBalance;
    if (tokenType == TokenType.TNT20) {
        const tnt20Contract = new thetajs.Contract(tokenContractAddress, MockTNT20Contract.abi, wallet);
        tokenBalance = await tnt20Contract.balanceOf(queriedAddress);
    } else if (tokenType == TokenType.TNT721) {
        const tnt721Contract = new thetajs.Contract(tokenContractAddress, MockTNT721Contract.abi, wallet);
        try {
            tokenOwner = await tnt721Contract.ownerOf(tokenID);
        } catch { // TNT721 contract asserts if the NFT with tokenID has already burned
            tokenOwner = 0x0;
        }
        tokenBalance = (tokenOwner == queriedAddress) ? 1 : 0;
    } else if (tokenType == TokenType.TNT1155) {
        const tnt1155Contract = new thetajs.Contract(tokenContractAddress, MockTNT1155Contract.abi, wallet);
        tokenBalance = await tnt1155Contract.balanceOf(queriedAddress, tokenID);
    } else {
        throw "getTNTTokenBalance: Invalid tokenType"
    }

    return tokenBalance;
}

// Note: a voucher is also a TNT token itself, so we can use the following function to approve
//       voucher access
async function approveTokenAccess(tokenType, sourceChainIDStr, sourceChainRPC, tokenContractAddress, spenderAddr, tokenID, amount, senderKeyPath, senderKeyPassword) {
    const provider = createProvider(sourceChainIDStr, sourceChainRPC);
    const senderWallet = createWallet(provider, senderKeyPath, senderKeyPassword);

    let approveTx;
    if (tokenType == TokenType.TNT20) {
        const tnt20Contract = new thetajs.Contract(tokenContractAddress, MockTNT20Contract.abi, senderWallet);
        approveTx = await tnt20Contract.approve(spenderAddr, amount);
    } else if (tokenType == TokenType.TNT721) {
        const tnt721Contract = new thetajs.Contract(tokenContractAddress, MockTNT721Contract.abi, senderWallet);
        approveTx = await tnt721Contract.approve(spenderAddr, tokenID);
    } else if (tokenType == TokenType.TNT1155) {
        const tnt1155Contract = new thetajs.Contract(tokenContractAddress, MockTNT1155Contract.abi, senderWallet);
        approveTx = await tnt1155Contract.setApprovalForAll(spenderAddr, true);
    } else {
        throw "getTNTTokenBalance: Invalid tokenType"
    }

    console.log("approve tx:", approveTx.hash)
}

async function isVoucherContract(tokenType, sourceChainIDStr, sourceChainRPC, tokenOrVoucherContractAddr) {
    const provider = createProvider(sourceChainIDStr, sourceChainRPC);
    const wallet = createWallet(provider);

    let tokenBankContract;
    if (sourceChainIDStr == cfg().mainchainIDStr) {
        if (tokenType == TokenType.TNT20) {
            tokenBankContract = new thetajs.Contract(cfg().mainchainTNT20TokenBankAddr, TNT20TokenBankContract.abi, wallet);
        } else if (tokenType == TokenType.TNT721) {
            tokenBankContract = new thetajs.Contract(cfg().mainchainTNT721TokenBankAddr, TNT721TokenBankContract.abi, wallet);
        } else if (tokenType == TokenType.TNT1155) {
            tokenBankContract = new thetajs.Contract(cfg().mainchainTNT1155TokenBankAddr, TNT1155TokenBankContract.abi, wallet);
        } else {
            throw "isVoucherContract: Invalid tokenType (mainchain)"
        }
    } else if (sourceChainIDStr == cfg().subchainIDStr) {
        if (tokenType == TokenType.TNT20) {
            tokenBankContract = new thetajs.Contract(cfg().subchainTNT20TokenBankAddr, TNT20TokenBankContract.abi, wallet);
        } else if (tokenType == TokenType.TNT721) {
            tokenBankContract = new thetajs.Contract(cfg().subchainTNT721TokenBankAddr, TNT721TokenBankContract.abi, wallet);
        } else if (tokenType == TokenType.TNT1155) {
            tokenBankContract = new thetajs.Contract(cfg().subchainTNT1155TokenBankAddr, TNT1155TokenBankContract.abi, wallet);
        } else {
            throw "isVoucherContract: Invalid tokenType (subchain)"
        }
    } else {
        throw "Invalid sourceChainIDStr"
    }

    let voucherExists = tokenBankContract.functions["exists(address)"] // the TokenBank contract overloads the "exists()" function
    let results = await voucherExists(tokenOrVoucherContractAddr);
    let isVoucher = results[0]

    return isVoucher;
}

function getSourceAndTargetChainTokenBank(tokenType, targetChainID, senderKeyPath, senderKeyPassword) {
    let mainchainProvider = createProvider(cfg().mainchainIDStr, cfg().mainchainRPC)
    let senderWalletOnMainchain = createWallet(mainchainProvider, senderKeyPath, senderKeyPassword)
    
    let subchainProvider = createProvider(cfg().subchainIDStr, cfg().subchainRPC)
    let senderWalletOnSubchain = createWallet(subchainProvider, senderKeyPath, senderKeyPassword)
    
    let mainchainTokenBankContract, subchainTokenBankContract;
    if (tokenType == TokenType.TNT20) {
        mainchainTokenBankContract = new thetajs.Contract(cfg().mainchainTNT20TokenBankAddr, TNT20TokenBankContract.abi, senderWalletOnMainchain);
        subchainTokenBankContract = new thetajs.Contract(cfg().subchainTNT20TokenBankAddr, TNT20TokenBankContract.abi, senderWalletOnSubchain);
    } else if (tokenType == TokenType.TNT721) {
        mainchainTokenBankContract = new thetajs.Contract(cfg().mainchainTNT721TokenBankAddr, TNT721TokenBankContract.abi, senderWalletOnMainchain);
        subchainTokenBankContract = new thetajs.Contract(cfg().subchainTNT721TokenBankAddr, TNT721TokenBankContract.abi, senderWalletOnSubchain);
    } else if (tokenType == TokenType.TNT1155) {
        mainchainTokenBankContract = new thetajs.Contract(cfg().mainchainTNT1155TokenBankAddr, TNT1155TokenBankContract.abi, senderWalletOnMainchain);
        subchainTokenBankContract = new thetajs.Contract(cfg().subchainTNT1155TokenBankAddr, TNT1155TokenBankContract.abi, senderWalletOnSubchain);
    } else {
        throw "getSourceAndTargetChainTokenBank: Invalid tokenType"
    }

    let sourceChainTokenBankContract, targetChainTokenBankContract;
    if (targetChainID == cfg().subchainID) {
        sourceChainTokenBankContract = mainchainTokenBankContract;
        targetChainTokenBankContract = subchainTokenBankContract;
    } else {
        sourceChainTokenBankContract = subchainTokenBankContract;
        targetChainTokenBankContract = mainchainTokenBankContract;
    }

    return {sourceChainTokenBankContract, targetChainTokenBankContract}
}

async function lockTNTTokens(tokenType, senderKeyPath, senderKeyPassword, sourceChainTokenAddr, targetChainID, targetChainReceiver, tokenID, amount) {
    let value = expandTo18Decimals(cfg().crossChainTransferFeeInTFuel);
    let tx;

    let {sourceChainTokenBankContract} = getSourceAndTargetChainTokenBank(tokenType, targetChainID, senderKeyPath, senderKeyPassword);
    if (tokenType == TokenType.TNT20) {
        tx = await sourceChainTokenBankContract.lockTokens(targetChainID, sourceChainTokenAddr, targetChainReceiver, amount, {value: value.toString()});
    } else if (tokenType == TokenType.TNT721) {
        tx = await sourceChainTokenBankContract.lockTokens(targetChainID, sourceChainTokenAddr, targetChainReceiver, tokenID, {value: value.toString()});
    } else if (tokenType == TokenType.TNT1155) {
        tx = await sourceChainTokenBankContract.lockTokens(targetChainID, sourceChainTokenAddr, targetChainReceiver, tokenID, amount, {value: value.toString()});
    } else {
        throw "lockTNTTokens: Invalid tokenType"
    }

    return tx;
}

async function burnTNTVouchers(tokenType, senderKeyPath, senderKeyPassword, sourceChainVoucherAddr, denom, targetChainReceiver, tokenID, amount) {
    let value = expandTo18Decimals(cfg().crossChainTransferFeeInTFuel);
    let tx;

    let originChainID = extractOriginChainIDFromDenom(denom);
    let targetChainID = originChainID; // for voucher burn, the target chain is the chain where the authentic token contract was deployed
    let {sourceChainTokenBankContract} = getSourceAndTargetChainTokenBank(tokenType, targetChainID, senderKeyPath, senderKeyPassword);
    if (tokenType == TokenType.TNT20) {
        tx = await sourceChainTokenBankContract.burnVouchers(sourceChainVoucherAddr, targetChainReceiver, amount, {value: value.toString()});
    } else if (tokenType == TokenType.TNT721) {
        tx = await sourceChainTokenBankContract.burnVouchers(sourceChainVoucherAddr, targetChainReceiver, tokenID, {value: value.toString()});
    } else if (tokenType == TokenType.TNT1155) {
        tx = await sourceChainTokenBankContract.burnVouchers(sourceChainVoucherAddr, targetChainReceiver, tokenID, amount, {value: value.toString()});
    } else {
        throw "burnTNTVouchers: Invalid tokenType"
    }
    
    return tx;
}

async function transferTNT(tokenType, senderKeyPath, senderKeyPassword, sourceChainTokenOrVoucherContractAddr, targetChainID, targetChainReceiver, tokenID, amount) {
    if (targetChainID != cfg().subchainID && targetChainID != cfg().mainchainID) {
        throw "transferTNT: Invalid target chain ID";
    }

    //
    // Step 1. Check if sourceChainTokenOrVoucherContractAddr is a token address ors a voucher address
    //

    let {sourceChainID, sourceChainIDStr, sourceChainRPC, targetChainIDStr, targetChainRPC} = getContextFromTargetChainID(targetChainID);
    let sourceChainSenderWallet = getWallet(sourceChainIDStr, sourceChainRPC, senderKeyPath, senderKeyPassword);
    let {sourceChainTokenBankContract, targetChainTokenBankContract} = getSourceAndTargetChainTokenBank(tokenType, targetChainID, senderKeyPath, senderKeyPassword);
    let targetChainTokenOrVoucherContractAddr, denom;

    let voucherExists = sourceChainTokenBankContract.functions["exists(address)"] // the TokenBank contract overloads the "exists()" function
    let resutls = await voucherExists(sourceChainTokenOrVoucherContractAddr);
    let isVoucher = resutls[0];
    if (isVoucher) { // sourceChainTokenOrVoucherContractAddr is a voucher contract address
        denom = await sourceChainTokenBankContract.getDenom(sourceChainTokenOrVoucherContractAddr);
        targetChainTokenOrVoucherContractAddr = extractContractAddressFromDenom(denom);
    } else { // sourceChainTokenOrVoucherContractAddr is a token contract address
        denom = buildDenom(sourceChainID, tokenType, sourceChainTokenOrVoucherContractAddr);
        targetChainTokenOrVoucherContractAddr = await targetChainTokenBankContract.getVoucher(denom); // should return 0x0 if the voucher contract has not been deployed yet, e.g. before the first transfer of the TNT token
    }

    //
    // Step 2. Query and print the sender/receiver balance before the cross-chain transfer
    //

    let sourceChainSenderAddr = sourceChainSenderWallet.getAddress();
    await printSenderReceiverBalances(tokenType,
        sourceChainIDStr, sourceChainRPC, sourceChainTokenOrVoucherContractAddr, tokenID, sourceChainSenderAddr, 
        targetChainIDStr, targetChainRPC, targetChainTokenOrVoucherContractAddr, tokenID, targetChainReceiver, getTNTTokenBalance);
    
    let targetChainReceiverInitialBalance = await getTNTTokenBalance(tokenType, targetChainIDStr, targetChainRPC, targetChainTokenOrVoucherContractAddr, tokenID, targetChainReceiver);

    //
    // Step 3. Lock tokens/Burn vouchers on the source chain to initiate the cross-chain transfer
    //

    if (!isVoucher) { // sourceChainTokenOrVoucherContractAddr is a token contract address
        let lockTx = await lockTNTTokens(tokenType, senderKeyPath, senderKeyPassword, sourceChainTokenOrVoucherContractAddr, targetChainID, targetChainReceiver, tokenID, amount);
        console.log(`lock tokens tx (on chain ${sourceChainID}):`, lockTx.hash, "\n");
    } else { // sourceChainTokenOrVoucherContractAddr is a voucher contract address
        let burnTx = await burnTNTVouchers(tokenType, senderKeyPath, senderKeyPassword, sourceChainTokenOrVoucherContractAddr, denom, targetChainReceiver, tokenID, amount);
        console.log(`burn vouchers tx (on chain ${sourceChainID}):`, burnTx.hash, "\n");
    }

    //
    // Step 4. Wait for the cross-chain transfer to complete
    //

    await detectTargetChainReceiverBalanceChanges(targetChainIDStr, targetChainRPC, tokenType, denom, 
        targetChainTokenBankContract, targetChainTokenOrVoucherContractAddr, tokenID, targetChainReceiver, targetChainReceiverInitialBalance, getTNTTokenBalance);
    
    //
    // Step 5. Query and print the sender/receiver balance after the cross-chain transfer
    //
    
    if (targetChainTokenOrVoucherContractAddr == 0x0) { // the first transfer
        targetChainTokenOrVoucherContractAddr = await targetChainTokenBankContract.getVoucher(denom)
    }

    await printSenderReceiverBalances(tokenType,
        sourceChainIDStr, sourceChainRPC, sourceChainTokenOrVoucherContractAddr, tokenID, sourceChainSenderAddr, 
        targetChainIDStr, targetChainRPC, targetChainTokenOrVoucherContractAddr, tokenID, targetChainReceiver, getTNTTokenBalance);
}

module.exports = {
    isVoucherContract,
    approveTokenAccess,
    transferTNT
}