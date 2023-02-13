const thetajs = require("@thetalabs/theta-js");
const {cfg} = require("./configs.js")
const {TFuelTokenBankContract, TokenType, DontCare, createProvider, createWallet, getWallet, 
    getContextFromTargetChainID, printSenderReceiverBalances, detectTargetChainReceiverBalanceChanges, expandTo18Decimals} = require("./common.js")

async function getTFuelBalance(tokenType, chainIDStr, rpc, tokenAddrPlaceHolder, tokenIDPlaceHolder, queriedAddress) {
    const provider = createProvider(chainIDStr, rpc);
    let account;
    try {
        account = await provider.getAccount(queriedAddress);
    } catch (error) {
        if (error.code == -32000) { // TODO: should check if it is the "account not found" error (which means the account has been been created yet)
            return 0;
        }
    }
    return account.coins.tfuelwei;
}

async function lockTFuelOnMainchain(senderKeyPath, senderKeyPassword, targetChainReceiver, amountInWei) {
    const provider = createProvider(cfg().mainchainIDStr, cfg().mainchainRPC);
    const senderWallet = createWallet(provider, senderKeyPath, senderKeyPassword);
    const mainchainTFuelTokenBank = new thetajs.Contract(cfg().mainchainTFuelTokenBankAddr, TFuelTokenBankContract.abi, senderWallet)    
    let value = amountInWei.add(expandTo18Decimals(cfg().crossChainTransferFeeInTFuel));
    let tx = await mainchainTFuelTokenBank.lockTokens(cfg().subchainID, targetChainReceiver, {value: value.toString()});
    console.log("lock tokens tx (mainchain):", tx.hash, "\n");
}

async function burnTFuelVoucherOnSubchain(senderKeyPath, senderKeyPassword, targetChainReceiver, amountInWei) {
    const provider = createProvider(cfg().subchainIDStr, cfg().subchainRPC);
    const senderWallet = createWallet(provider, senderKeyPath, senderKeyPassword);
    const subchainTFuelTokenBank = new thetajs.Contract(cfg().subchainTFuelTokenBankAddr, TFuelTokenBankContract.abi, senderWallet)
    let value = amountInWei.add(expandTo18Decimals(cfg().crossChainTransferFeeInTFuel));
    let tx = await subchainTFuelTokenBank.burnVouchers(targetChainReceiver, {value: value.toString()});
    console.log("burn vouchers tx (subchain):", tx.hash, "\n");
}

async function transferTFuel(senderKeyPath, senderKeyPassword, targetChainID, targetChainReceiver, amountInWei) {
    if (targetChainID != cfg().subchainID && targetChainID != cfg().mainchainID) {
        throw "transferTFuel: Invalid target chain ID";
    }

    let {sourceChainIDStr, sourceChainRPC, targetChainIDStr, targetChainRPC} = getContextFromTargetChainID(targetChainID);
    let sourceChainSenderWallet = getWallet(sourceChainIDStr, sourceChainRPC, senderKeyPath, senderKeyPassword);
    let sourceChainSenderAddr = sourceChainSenderWallet.getAddress()


    //
    // Step 1. Query and print the sender/receiver balance before the cross-chain transfer
    //
    
    await printSenderReceiverBalances(TokenType.TFuel, 
        sourceChainIDStr, sourceChainRPC, DontCare, DontCare, sourceChainSenderAddr, 
        targetChainIDStr, targetChainRPC, DontCare, DontCare, targetChainReceiver, getTFuelBalance);

    let targetChainReceiverInitialBalance = await getTFuelBalance(TokenType.TFuel, targetChainIDStr, targetChainRPC, DontCare, DontCare, targetChainReceiver);

    //
    // Step 2. Lock tokens/Burn vouchers on the source chain to initiate the cross-chain transfer
    //
    
    if (targetChainID == cfg().subchainID) {
        await lockTFuelOnMainchain(senderKeyPath, senderKeyPassword, targetChainReceiver, amountInWei)
    } else if (targetChainID == cfg().mainchainID) {
        await burnTFuelVoucherOnSubchain(senderKeyPath, senderKeyPassword, targetChainReceiver, amountInWei)
    }

    //
    // Step 3. Wait for the cross-chain transfer to complete
    //
    
    await detectTargetChainReceiverBalanceChanges(targetChainIDStr, targetChainRPC, TokenType.TFuel, DontCare,
        DontCare, DontCare, DontCare, targetChainReceiver, targetChainReceiverInitialBalance, getTFuelBalance);

    //
    // Step 4. Query and print the sender/receiver balance afters the cross-chain transfer
    //
    await printSenderReceiverBalances(TokenType.TFuel, 
        sourceChainIDStr, sourceChainRPC, DontCare, DontCare, sourceChainSenderAddr, 
        targetChainIDStr, targetChainRPC, DontCare, DontCare, targetChainReceiver, getTFuelBalance);    
}

module.exports = {
    transferTFuel
}