const thetajs = require("@thetalabs/theta-js");
const {cfg} = require("./configs")
const {isVoucherContract} = require("./tntUtils")
const {TokenType, createProvider, createWallet, getWallet} = require("./common.js")

const MockTNT20Contract = require("../contracts/MockTNT20.json")
const MockTNT721Contract = require("../contracts/MockTNT721.json")
const MockTNT1155Contract = require("../contracts/MockTNT1155.json")

async function mintMockTNTTokens(tokenType, chainIDStr, chainRPC, tokenContractAddr, receivingAddr, tokenID, amount, minterKeyPath, minterKeyPassword) {
    const provider = createProvider(chainIDStr, chainRPC);
    const minterWallet = createWallet(provider, minterKeyPath, minterKeyPassword);
        
    let tntTokenContract, mintTx;
    if (tokenType == TokenType.TNT20) {
        tntTokenContract = new thetajs.Contract(tokenContractAddr, MockTNT20Contract.abi, minterWallet);
        mintTx = await tntTokenContract.mint(receivingAddr, amount);
    } else if (tokenType == TokenType.TNT721) {
        tntTokenContract = new thetajs.Contract(tokenContractAddr, MockTNT721Contract.abi, minterWallet);
        mintTx = await tntTokenContract.mint(receivingAddr, tokenID);
    } else if (tokenType == TokenType.TNT1155) {
        tntTokenContract = new thetajs.Contract(tokenContractAddr, MockTNT1155Contract.abi, minterWallet);
        mintTx = await tntTokenContract.mint(receivingAddr, tokenID, amount, []);
    } else {
        throw "mintMockTNTTokens: Invalid tokenType"
    }

    return mintTx;
}

async function mintMockTNTTokensOnMainchain(tokenType, tokenContractAddr, receivingAddr, tokenID, amount, minterKeyPath, minterKeyPassword) {
    let mintTx = await mintMockTNTTokens(tokenType, cfg().mainchainIDStr, cfg().mainchainRPC, tokenContractAddr, receivingAddr, tokenID, amount, minterKeyPath, minterKeyPassword);
    console.log("mintTx (on mainchain):", mintTx.hash);
}

async function mintMockTNTTokensOnSubchain(tokenType, tokenContractAddr, receivingAddr, tokenID, amount, minterKeyPath, minterKeyPassword) {
    let mintTx = await mintMockTNTTokens(tokenType, cfg().subchainIDStr, cfg().subchainRPC, tokenContractAddr, receivingAddr, tokenID, amount, minterKeyPath, minterKeyPassword);
    console.log("mintTx (on subchain):", mintTx.hash);
}

async function mintMockTNTTokensIfNeeded(tokenType, sourceChainTokenOrVoucherContract, targetChainID, tokenID, amount, minterKeyPath, minterKeyPassword) {
    if ((targetChainID != cfg().subchainID) && (targetChainID != cfg().mainchainID)) {
        throw "mintMockTNTTokensIfNeeded: Invalid targetChainID";
    }

    let sourceChainIDStr, sourceChainRPC;
    if (targetChainID == cfg().subchainID) {
        sourceChainIDStr = cfg().mainchainIDStr
        sourceChainRPC = cfg().mainchainRPC
    } else if (targetChainID == cfg().mainchainID) {
        sourceChainIDStr = cfg().subchainIDStr
        sourceChainRPC = cfg().subchainRPC
    }

    let minterWallet = getWallet(sourceChainIDStr, sourceChainRPC, minterKeyPath, minterKeyPassword);

    let isVoucher = await isVoucherContract(tokenType, sourceChainIDStr, sourceChainRPC, sourceChainTokenOrVoucherContract);
    if (!isVoucher) { // mint tokens only if the contract is a Token contract
        if (targetChainID == cfg().subchainID) {
            await mintMockTNTTokensOnMainchain(tokenType, sourceChainTokenOrVoucherContract, minterWallet.address, tokenID, amount, minterKeyPath, minterKeyPassword)
        } else if (targetChainID == cfg().mainchainID) {
            await mintMockTNTTokensOnSubchain(tokenType, sourceChainTokenOrVoucherContract, minterWallet.address, tokenID, amount, minterKeyPath, minterKeyPassword)
        }
    }
}

module.exports = {
    mintMockTNTTokensIfNeeded
}