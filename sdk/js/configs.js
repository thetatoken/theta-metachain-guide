
//
// Privatenet environment
//

let PrivatenetConfigs = {
    mainchainID : 366,
    mainchainIDStr : "privatenet",
    mainchainRPC : "http://127.0.0.1:16888/rpc",
    wTHETAAddr : "0x7d73424a8256C0b2BA245e5d5a3De8820E45F390",
    registrarOnMainchainAddr : "0x08425D9Df219f93d5763c3e85204cb5B4cE33aAa",
    govTokenContractAddr : "0x7ad6cea2bc3162e30a3c98d84f821b3233c22647",
    mainchainTFuelTokenBankAddr : "0xA10A3B175F0f2641Cf41912b887F77D8ef34FAe8",
    mainchainTNT20TokenBankAddr : "0x6E05f58eEddA592f34DD9105b1827f252c509De0",
    mainchainTNT721TokenBankAddr : "0x79EaFd0B5eC8D3f945E6BB2817ed90b046c0d0Af",
    mainchainTNT1155TokenBankAddr : "0x2Ce636d6240f8955d085a896e12429f8B3c7db26",

    subchainID : 360777,
    subchainIDStr : "tsub360777",
    subchainRPC : "http://127.0.0.1:16900/rpc",
    subchainTFuelTokenBankAddr : "0x5a443704dd4B594B382c22a083e2BD3090A6feF3",
    subchainTNT20TokenBankAddr : "0x47e9Fbef8C83A1714F1951F142132E6e90F5fa5D",
    subchainTNT721TokenBankAddr : "0x8Be503bcdEd90ED42Eff31f56199399B2b0154CA",
    subchainTNT1155TokenBankAddr : "0x47c5e40890bcE4a473A49D7501808b9633F29782",
    initialFee : 20000,

    crossChainTransferFeeInTFuel : 10
}

//
// Testnet environment
//

let TestnetConfigs = {
    mainchainID : 365,
    mainchainIDStr : "testnet",
    // mainchainRPC: "http://54.151.72.227:16888/rpc",
    mainchainRPC : "http://127.0.0.1:16888/rpc",
    wTHETAAddr : "0x90e6ca1087a2340da858069cb8d78d595e4ac798",
    registrarOnMainchainAddr : "<ADDR_OF_YOUR_GOV_TOKEN_CONTRACT>",
    govTokenContractAddr : "0x0219ccba77e8924449194e5add722f2108f62982",
    mainchainTFuelTokenBankAddr : "0x06a6Ae061f96bDe82Df9287B8CcceA8BF3f4fE98",
    mainchainTNT20TokenBankAddr : "0x8630cBf6Ff7a0d2d0De7532a9699ab09814990E7",
    mainchainTNT721TokenBankAddr : "0x13dF4dE155382bf91C435f1B0D5d5cD1E9DE0fe0",
    mainchainTNT1155TokenBankAddr : "0x9141534881A49480cA2657dc71DBd647c9A9f379",

    subchainID : "<YOUR_EVM_CHAIN_ID_INT>", // e.g. 1666666
    subchainIDStr : "<tsub+YOUR_EVM_CHAIN_ID_INT>", // e.g. "tsub1666666"
    subchainRPC : "http://127.0.0.1:16900/rpc",
    subchainTFuelTokenBankAddr : "0x5a443704dd4B594B382c22a083e2BD3090A6feF3",
    subchainTNT20TokenBankAddr : "0x47e9Fbef8C83A1714F1951F142132E6e90F5fa5D",
    subchainTNT721TokenBankAddr : "0x8Be503bcdEd90ED42Eff31f56199399B2b0154CA",
    subchainTNT1155TokenBankAddr : "0x47c5e40890bcE4a473A49D7501808b9633F29782",
    initialFee : 100000,

    crossChainTransferFeeInTFuel : 10
}


let MainnetConfigs = {
    mainchainID : 361,
    mainchainIDStr : "mainnet",
    mainchainRPC: "https://theta-bridge-wallet-partner.thetatoken.org/rpc",
    wTHETAAddr : "0xaf537fb7e4c77c97403de94ce141b7edb9f7fcf0",
    registrarOnMainchainAddr : "0x3255bD439c11fa45dE90F042dBF8d37D75698322",
    govTokenContractAddr : "<ADDR_OF_YOUR_GOV_TOKEN_CONTRACT>",
    mainchainTFuelTokenBankAddr : "", // TODO: update the contract addresses
    mainchainTNT20TokenBankAddr : "",
    mainchainTNT721TokenBankAddr : "",
    mainchainTNT1155TokenBankAddr : "",

    subchainID : "<YOUR_EVM_CHAIN_ID_INT>", // e.g. 1666666
    subchainIDStr : "<tsub+YOUR_EVM_CHAIN_ID_INT>", // e.g. "tsub1666666"
    subchainRPC : "<YOUR_SUBCHAIN_NATIVE_RPC_URL>",
    subchainTFuelTokenBankAddr : "0x5a443704dd4B594B382c22a083e2BD3090A6feF3",
    subchainTNT20TokenBankAddr : "0x47e9Fbef8C83A1714F1951F142132E6e90F5fa5D",
    subchainTNT721TokenBankAddr : "0x8Be503bcdEd90ED42Eff31f56199399B2b0154CA",
    subchainTNT1155TokenBankAddr : "0x47c5e40890bcE4a473A49D7501808b9633F29782",
    initialFee : 20000,

    crossChainTransferFeeInTFuel : 10
}

let _cfg;

const NetworkType = {
    Privatenet: "privatenet",
    Testnet: "testnet",
    Mainnet: "mainnet"
}

function setCfg(networkType) {
    if (networkType == NetworkType.Privatenet) {
        _cfg = PrivatenetConfigs;
    } else if (networkType == NetworkType.Testnet) {
        _cfg = TestnetConfigs;
    } else if (networkType == NetworkType.Mainnet) {
        _cfg = MainnetConfigs;
    } else {
        throw "setCfg: Invalid networkType"
    }
}

function cfg() {
    return _cfg;
}

module.exports = {
    cfg,
    setCfg
}