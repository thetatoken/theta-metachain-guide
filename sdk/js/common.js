
const fs = require('fs');
const path = require('path');
const prompt = require('prompt-sync')();
const thetajs = require("@thetalabs/theta-js");
const { BigNumber } = require("@ethersproject/bignumber");
const {cfg} = require("./configs.js")

const ChainRegistrarOnMainchainContract = require("../contracts/ChainRegistrarOnMainchain.json");
const SubchainGovernanceTokenContract = require("../contracts/SubchainGovernanceToken.json")
const TNT20TokenInterface = require("../contracts/ITNT20.json")

const TFuelTokenBankContract = require("../contracts/TFuelTokenBank.json")
const TNT20TokenBankContract = require("../contracts/TNT20TokenBank.json")
const TNT721TokenBankContract = require("../contracts/TNT721TokenBank.json")
const TNT1155TokenBankContract = require("../contracts/TNT1155TokenBank.json")

const TokenType = {
    TFuel: 0,
    TNT20: 20,
    TNT721: 721,
    TNT1155: 1155
}

const DontCare = null;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function assertEq(bn1, bn2) {
    if (!BigNumber.from(bn1).eq(bn2)) {
        throw `${bn1} != ${bn2}`;
    }
};

function expandTo18Decimals(n) {
    return BigNumber.from(n).mul(BigNumber.from(10).pow(18))
}

// For privatenet, simply input: qwertyuiop
async function promptForWalletPassword() {
    let password = prompt.hide('wallet password: ');
    return password;
}

function createProvider(chainIDStr, rpc) {
    // console.log("createProvider, chainIDStr:", chainIDStr, ", rpc:", rpc)
    const provider = new thetajs.providers.HttpProvider(chainIDStr, rpc);
    return provider;
}

function getWallet(chainIDStr, rpc, keyPath, keyPassword) {
    const provider = createProvider(chainIDStr, rpc);
    const wallet = createWallet(provider, keyPath, keyPassword);
    return wallet;
}

// Create wallet
function createWallet(provider, keyPath, password) {
    if (keyPath == null) {
        const wallet = thetajs.Wallet.createRandom();
        return wallet.connect(provider);
    } else {
        const json = fs.readFileSync(path.resolve(keyPath));
        const wallet = thetajs.Wallet.fromEncryptedJson(json, password);
        return wallet.connect(provider);
    }
}

function getContextFromSourceChainID(sourceChainID) {
    let targetChainID
    if (sourceChainID == cfg().mainchainID) {
        targetChainID = cfg().subchainID
    } else if (sourceChainID == cfg().subchainID) {
        targetChainID = cfg().mainchainID
    } else {
        throw "getContextFromSourceChainID: invalid target chain ID"
    }
    return getContextFromTargetChainID(targetChainID)
}

function getContextFromTargetChainID(targetChainID) {
    let sourceChainID, sourceChainIDStr, sourceChainRPC, targetChainIDStr, targetChainRPC
    if (targetChainID == cfg().subchainID) {
        sourceChainID = cfg().mainchainID
        sourceChainIDStr = cfg().mainchainIDStr
        sourceChainRPC = cfg().mainchainRPC
        targetChainIDStr = cfg().subchainIDStr
        targetChainRPC = cfg().subchainRPC
    } else if (targetChainID == cfg().mainchainID) {
        sourceChainID = cfg().subchainID
        sourceChainIDStr = cfg().subchainIDStr
        sourceChainRPC = cfg().subchainRPC
        targetChainIDStr = cfg().mainchainIDStr
        targetChainRPC = cfg().mainchainRPC
    } else {
        throw "getContextFromTargetChainID: invalid target chain ID"
    }   
    return {sourceChainID, sourceChainIDStr, sourceChainRPC, targetChainID, targetChainIDStr, targetChainRPC}
}

async function printSenderReceiverBalances(tokenType, sourceChainIDStr, sourceChainRPC, sourceChainTokenAddr, sourceChainTokenID, sourceChainSenderAddr, 
    targetChainIDStr, targetChainRPC, targetChainTokenAddr, targetChainTokenID, targetChainReceiverAddr, balanceGetter) {
    let senderBalance, receiverBalance;
    if (sourceChainTokenAddr == 0) {
        senderBalance = 0;
    } else {
        senderBalance = await balanceGetter(tokenType, sourceChainIDStr, sourceChainRPC, sourceChainTokenAddr, sourceChainTokenID, sourceChainSenderAddr);
    }
    if (targetChainTokenAddr == 0) {
        receiverBalance = 0;
    } else {
        receiverBalance = await balanceGetter(tokenType, targetChainIDStr, targetChainRPC, targetChainTokenAddr, targetChainTokenID, targetChainReceiverAddr);
    }
    console.log("Source chain token/voucher contract:", sourceChainTokenAddr);
    console.log("Target chain token/voucher contract:", targetChainTokenAddr);
    console.log("sourceChainIDStr:", sourceChainIDStr)
    console.log("Sender  ", sourceChainSenderAddr, "balance on the source chain:", senderBalance.toString());
    console.log("Receiver", targetChainReceiverAddr, "balance on the target chain:", receiverBalance.toString());
    console.log("") 
    return {senderBalance, receiverBalance}
}

async function detectTargetChainReceiverBalanceChanges(targetChainIDStr, targetChainRPC, tokenType, denom,
    targetChainTokenBankContract, targetChainTokenOrVoucherAddr, tokenID, receiverAddr, receiverPreviousBalance, balanceGetter) {
    while (true) {
        await sleep(1000);
        console.log("Waiting for the cross-chain transfer to finalize...")
        if (tokenType != TokenType.TFuel && targetChainTokenOrVoucherAddr == 0x0) { 
            // the voucher contract on the target chain may not be deployed yet, need to continue to query
            targetChainTokenOrVoucherAddr = await targetChainTokenBankContract.getVoucher(denom)
        }

        let receiverBalance = await balanceGetter(tokenType, targetChainIDStr, targetChainRPC, 
            targetChainTokenOrVoucherAddr, tokenID, receiverAddr);
        // console.log("receiverPreviousBalance:", receiverPreviousBalance)
        // console.log("receiverBalance        :", receiverBalance)

        if (!BigNumber.from(receiverBalance).eq(BigNumber.from(receiverPreviousBalance))) {
            break
        }
    }
    console.log("")
}

function buildDenom(originChainID, tokenTypeStr, originChainTokenContractAddr) {
    let denom = originChainID.toString() + "/" + tokenTypeStr + "/" + originChainTokenContractAddr;
    return denom.toLowerCase();
}

function extractOriginChainIDFromDenom(denom) {
    let parts = denom.split("/");
    return parts[0];
}

function extractContractAddressFromDenom(denom) {
    let parts = denom.split("/");
    return parts[parts.length - 1];
}

function getTokenBank(tokenType, chainID, senderKeyPath, senderKeyPassword) {
    let chainIDStr, chainRPC
    if (chainID == cfg().mainchainID) {
        chainIDStr = cfg().mainchainIDStr
        chainRPC = cfg().mainchainRPC
    } else if (chainID == cfg().subchainID) {
        chainIDStr = cfg().subchainIDStr
        chainRPC = cfg().subchainRPC
    } else {
        throw "getTNTTokenBank: invalid chainID"
    }

    const provider = createProvider(chainIDStr, chainRPC);
    const senderWallet = createWallet(provider, senderKeyPath, senderKeyPassword);
    
    let tokenBank;
    if (chainID == cfg().mainchainID) {
        if (tokenType == TokenType.TFuel) {
            tokenBank = new thetajs.Contract(cfg().mainchainTFuelTokenBankAddr, TFuelTokenBankContract.abi, senderWallet);
        } else if (tokenType == TokenType.TNT20) {
            tokenBank = new thetajs.Contract(cfg().mainchainTNT20TokenBankAddr, TNT20TokenBankContract.abi, senderWallet);
        } else if (tokenType == TokenType.TNT721) {
            tokenBank = new thetajs.Contract(cfg().mainchainTNT721TokenBankAddr, TNT721TokenBankContract.abi, senderWallet);
        } else if (tokenType == TokenType.TNT1155) {
            tokenBank = new thetajs.Contract(cfg().mainchainTNT1155TokenBankAddr, TNT1155TokenBankContract.abi, senderWallet);
        } else {
            throw "getTNTTokenBank: Invalid tokenType (mainchain)";
        }
    } else if (chainID == cfg().subchainID) {
        if (tokenType == TokenType.TFuel) {
            tokenBank = new thetajs.Contract(cfg().subchainTFuelTokenBankAddr, TFuelTokenBankContract.abi, senderWallet);
        } else if (tokenType == TokenType.TNT20) {
            tokenBank = new thetajs.Contract(cfg().subchainTNT20TokenBankAddr, TNT20TokenBankContract.abi, senderWallet);
        } else if (tokenType == TokenType.TNT721) {
            tokenBank = new thetajs.Contract(cfg().subchainTNT721TokenBankAddr, TNT721TokenBankContract.abi, senderWallet);
        } else if (tokenType == TokenType.TNT1155) {
            tokenBank = new thetajs.Contract(cfg().subchainTNT1155TokenBankAddr, TNT1155TokenBankContract.abi, senderWallet);
        } else {
            throw "getTNTTokenBank: Invalid tokenType (subchain)";
        }
    }

    return tokenBank;
}

module.exports = {
    ChainRegistrarOnMainchainContract,
    SubchainGovernanceTokenContract,
    TNT20TokenInterface,
    TFuelTokenBankContract,
    TNT20TokenBankContract,
    TNT721TokenBankContract,
    TNT1155TokenBankContract,
    TokenType,
    DontCare,
    sleep,
    assertEq,
    expandTo18Decimals,
    promptForWalletPassword,
    createProvider,
    getWallet,
    createWallet,
    getContextFromSourceChainID,
    getContextFromTargetChainID,
    printSenderReceiverBalances,
    detectTargetChainReceiverBalanceChanges,
    buildDenom,
    extractOriginChainIDFromDenom,
    extractContractAddressFromDenom,
    getTokenBank
}