# Cross-chain Asset Transfers

**IMPORTANT**: The following instructions are currently being revised and are a WORK IN PROGRESS. Please proceed with caution and be aware that changes may be ongoing.

In addition to the `ChainRegistrarOnMainchain` contract, the Main Chain snapshot also include the Token Bankd contracts and some mock TNT tokens deployed at the following addresses. This guide shows how we can interact with these contracts to transfer assets between the Main Chain and the Subchain.

```
TFuelTokenBank   : 0xf83239088B8766a27cD1f46772a2E1f88e916322
TNT20TokenBank   : 0xB3d93735de018Ad48122bf7394734A7d18007e1b
TNT721TokenBank  : 0xFe2d1bE6bD9d342cfa59e75290F9b0B42cdBCDAF
TNT1155TokenBank : 0xA31168d669112937B0826b1Bf15f0eb12e6B1542

MockTNT20   : 0x430a67c3a67ce4aeb7923a4e783ac9260466af2f
MockTNT721  : 0xa02fb0579387b9c2190db80fcbf16fb0a15c0677
MockTNT1155 : 0x677e9ef40c153ac7bdbebabb07185dcde3eb7007
```

## 1. TFuel Transfers

**IMPORTANT NOTE**: Please wait until the subchain finalizes at least 100 blocks before testing the cross-chain transactions. Otherwise the cross-chain transactions could get stuck. Once the subchain start finalizing blocks, the Subchain validators should print `Notified finalized block, height=xxx` on the screen.

Please run the following commands to transfer TFuel between the Mainnet Main Chain and the Subchain. Note that you'd need to replace `<SUBCHAIN_EVM_chainID>` with the EVM `chainID` you reserved for the Subchain on [chainlist.org](https://chainlist.org/). Before testing the cross-chain transfers, please prepare a wallet (i.e. the `<YOUR_WALLET>` parameter in the commands below) with some TFuel (e.g. 1000 TFuel).

```shell
cd $METACHAIN_GUIDE_ROOT
cd sdk/js

# Main Chain to Subchain Transfer:
node transferTFuel.js mainnet <SUBCHAIN_EVM_chainID> <YOUR_WALLET> 500000000000000000000 <PATH/TO/YOUR_WALLET/KEYSTORE> <YOUR_WALLET_PASSWORD>

# Subchain to Main Chain Transfer:
node transferTFuel.js mainnet 361 <YOUR_WALLET> 1000000000000000000 <PATH/TO/YOUR_WALLET/KEYSTORE> <YOUR_WALLET_PASSWORD>
```

## 2. TNT20 Token Transfers

Please run the following command to transfer TNT20 tokens between the mainchain and the subchain. The "authentic" TNT20 was deployed on the mainchain at address `0x430a67c3a67ce4aeb7923a4e783ac9260466af2f`:

```shell
cd $METACHAIN_GUIDE_ROOT
cd sdk/js

# Main Chain to Subchain Transfer (lock tokens on the mainchain):
node transferTNT20.js mainnet 0x430a67c3a67ce4aeb7923a4e783ac9260466af2f <SUBCHAIN_EVM_chainID> <YOUR_WALLET> 1000 <PATH/TO/YOUR_WALLET/KEYSTORE> <YOUR_WALLET_PASSWORD>

# Subchain to Main Chain Transfer (burn vouchers on the subchain):
node transferTNT20.js mainnet 0x7D7e270b7E279C94b265A535CdbC00Eb62E6e68f 361 <YOUR_WALLET> 88 <PATH/TO/YOUR_WALLET/KEYSTORE> <YOUR_WALLET_PASSWORD>
```

## 3. TNT721 Token Transfers

Please run the following command to transfer TNT721 tokens between the mainchain and the subchain. The "authentic" TNT721 was deployed on the mainchain at address `0xa02fb0579387b9c2190db80fcbf16fb0a15c0677`. You can specify a random integer for `<TOKEN_ID>`. Note that if a particular token ID has already been transfers, the cross-chain transfer might fail (which is expected).

```shell
cd $METACHAIN_GUIDE_ROOT
cd sdk/js

# Main Chain to Subchain Transfer (lock tokens on the mainchain):
node transferTNT721.js mainnet 0xa02fb0579387b9c2190db80fcbf16fb0a15c0677 <SUBCHAIN_EVM_chainID> <YOUR_WALLET> <TOKEN_ID> <PATH/TO/YOUR_WALLET/KEYSTORE> <YOUR_WALLET_PASSWORD>

# Subchain to Main Chain Transfer (burn vouchers on the subchain):
node transferTNT721.js mainnet 0xd5125d7bB9c4Fb222C522c4b1922cabC631E52D7 361 <YOUR_WALLET> <TOKEN_ID> <PATH/TO/YOUR_WALLET/KEYSTORE> <YOUR_WALLET_PASSWORD>
```

## 4. TNT1155 Token Transfers

Please run the following command to transfer TNT1155 tokens between the mainchain and the subchain. The "authentic" TNT1155 was deployed on the mainchain at address `0x677e9ef40c153ac7bdbebabb07185dcde3eb7007`:

```shell
cd $METACHAIN_GUIDE_ROOT
cd sdk/js

# Main Chain to Subchain Transfer (lock tokens on the mainchain):
node transferTNT1155.js mainnet 0x677e9ef40c153ac7bdbebabb07185dcde3eb7007 <SUBCHAIN_EVM_chainID> <YOUR_WALLET> 123 88888 <PATH/TO/YOUR_WALLET/KEYSTORE> <YOUR_WALLET_PASSWORD>

# Subchain to Main Chain Transfer (burn vouchers on the subchain):
node transferTNT1155.js mainnet 0x0ede92cAc9161F6C397A604DE508Dcd1e6f43E61 361 <YOUR_WALLET> 123 1111 <PATH/TO/YOUR_WALLET/KEYSTORE> <YOUR_WALLET_PASSWORD>
```
