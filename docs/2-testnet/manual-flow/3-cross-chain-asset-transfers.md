# Cross-chain Asset Transfers

In addition to the `ChainRegistrarOnMainchain` contract, the Main Chain snapshot also include the Token Bankd contracts and some mock TNT tokens deployed at the following addresses. This guide shows how we can interact with these contracts to transfer assets between the Main Chain and the Subchain.

```
TFuelTokenBank   : 0x1678BbaB6Db608B27Dac2802C1d89E280b8C2C8f
TNT20TokenBank   : 0x02Cbc51C5bbc37F93ad211a5F405aab00B0951b1
TNT721TokenBank  : 0x0603E7fad093A88C9ADBC685808961FADDAfFF97
TNT1155TokenBank : 0xD840b9662bf74Ae9838ccEf645E0D6d1573AA9E7

MockTNT20   : 0xC74c9a64d243bD2bc14C561E4D6B7DAAE19C73eA
MockTNT721  : 0x166f67eDad98c3382323e7E8E64C8dD24d9C29a7
MockTNT1155 : 0x9D2DAB964Eb49BDB944Bc91832123572b9a10619
```

## 1. TFuel Transfers

**IMPORTANT NOTE**: Please wait until the subchain finalizes at least 100 blocks before testing the cross-chain transactions. Otherwise the cross-chain transactions could get stuck. Once the subchain start finalizing blocks, the Subchain validators should print `Notified finalized block, height=xxx` on the screen.

Please run the following commands to transfer TFuel between the Testnet Main Chain and the Subchain. Note that you'd need to replace `<SUBCHAIN_EVM_chainID>` with the EVM `chainID` you reserved for the Subchain on [chainlist.org](https://chainlist.org/).

```shell
cd $METACHAIN_GUIDE_ROOT
cd sdk/js

# Main Chain to Subchain Transfer:
node transferTFuel.js testnet <SUBCHAIN_EVM_chainID> 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 500000000000000000000 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop

# Subchain to Main Chain Transfer:
node transferTFuel.js testnet 365 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 1000000000000000000 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
```

## 2. TNT20 Token Transfers

Please run the following command to transfer TNT20 tokens between the mainchain and the subchain. The "authentic" TNT20 was deployed on the mainchain at address `0xC74c9a64d243bD2bc14C561E4D6B7DAAE19C73eA`:

```shell
cd $METACHAIN_GUIDE_ROOT
cd sdk/js

# Main Chain to Subchain Transfer (lock tokens on the mainchain):
node transferTNT20.js testnet 0xC74c9a64d243bD2bc14C561E4D6B7DAAE19C73eA <SUBCHAIN_EVM_chainID> 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 1000 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop

# Subchain to Main Chain Transfer (burn vouchers on the subchain):
node transferTNT20.js testnet 0x7D7e270b7E279C94b265A535CdbC00Eb62E6e68f 365 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 88 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
```

## 3. TNT721 Token Transfers

Please run the following command to transfer TNT721 tokens between the mainchain and the subchain. The "authentic" TNT721 was deployed on the mainchain at address `0x166f67eDad98c3382323e7E8E64C8dD24d9C29a7`. You can specify a random integer for `<TOKEN_ID>`. Note that if a particular token ID has already been transfers, the cross-chain transfer might fail (which is expected).

```shell
cd $METACHAIN_GUIDE_ROOT
cd sdk/js

# Main Chain to Subchain Transfer (lock tokens on the mainchain):
node transferTNT721.js testnet 0x166f67eDad98c3382323e7E8E64C8dD24d9C29a7 <SUBCHAIN_EVM_chainID> 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab <TOKEN_ID> ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop

# Subchain to Main Chain Transfer (burn vouchers on the subchain):
node transferTNT721.js testnet 0xd5125d7bB9c4Fb222C522c4b1922cabC631E52D7 365 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab <TOKEN_ID> ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
```

## 4. TNT1155 Token Transfers

Please run the following command to transfer TNT1155 tokens between the mainchain and the subchain. The "authentic" TNT1155 was deployed on the mainchain at address `0x9D2DAB964Eb49BDB944Bc91832123572b9a10619`:

```shell
cd $METACHAIN_GUIDE_ROOT
cd sdk/js

# Main Chain to Subchain Transfer (lock tokens on the mainchain):
node transferTNT1155.js testnet 0x9D2DAB964Eb49BDB944Bc91832123572b9a10619 <SUBCHAIN_EVM_chainID> 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 123 88888 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop

# Subchain to Main Chain Transfer (burn vouchers on the subchain):
node transferTNT1155.js testnet 0x0ede92cAc9161F6C397A604DE508Dcd1e6f43E61 365 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 123 1111 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
```

## Next

Please proceed to the next step to [learn more about Subchain validator staking](./4-more-on-subchain-validator-staking.md).
