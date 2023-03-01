# Cross-chain Asset Transfers

In addition to the `ChainRegistrarOnMainchain` contract, the Main Chain snapshot also include the Token Bankd contracts and some mock TNT tokens deployed at the following addresses. This guide shows how we can interact with these contracts to transfer assets between the Main Chain and the Subchain.

```
TFuelTokenBank   : 0xA10A3B175F0f2641Cf41912b887F77D8ef34FAe8
TNT20TokenBank   : 0x6E05f58eEddA592f34DD9105b1827f252c509De0
TNT721TokenBank  : 0x79EaFd0B5eC8D3f945E6BB2817ed90b046c0d0Af
TNT1155TokenBank : 0x2Ce636d6240f8955d085a896e12429f8B3c7db26

MockTNT20   : 0x4fb87c52Bb6D194f78cd4896E3e574028fedBAB9
MockTNT721  : 0xEd8d61f42dC1E56aE992D333A4992C3796b22A74
MockTNT1155 : 0x47eb28D8139A188C5686EedE1E9D8EDE3Afdd543
```

Please also check out [this section](../../0-overview/README.md#step-7-test-cross-chain-asset-transfers) in the Overview page for more conceptual details of cross-chain asset transfer, for example the "source/target chain", "voucher tokens" etc.

## 1. TFuel Transfers

**IMPORTANT NOTE**: Please wait until the subchain finalizes at least 100 blocks before testing the cross-chain transactions. Otherwise the cross-chain transactions could get stuck. Once the subchain start finalizing blocks, the Subchain validators should print `Notified finalized block, height=xxx` on the screen.

Please run the following command to transfer TFuel between the mainchain and the subchain:

```shell
cd $METACHAIN_GUIDE_ROOT
cd sdk/js

# Main Chain to Subchain Transfer:
node transferTFuel.js privatenet 360777 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 100000000000000000000000 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop

# Subchain to Main Chain Transfer:
node transferTFuel.js privatenet 366 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 1000000000000000000 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
```

## 2. TNT20 Token Transfers

Please run the following command to transfer TNT20 tokens between the mainchain and the subchain. The "authentic" TNT20 was deployed on the mainchain at address `0x4fb87c52Bb6D194f78cd4896E3e574028fedBAB9`:

```shell
cd $METACHAIN_GUIDE_ROOT
cd sdk/js

# Main Chain to Subchain Transfer (lock tokens on the mainchain):
node transferTNT20.js privatenet 0x4fb87c52Bb6D194f78cd4896E3e574028fedBAB9 360777 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 12345 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop

# Subchain to Main Chain Transfer (burn vouchers on the subchain):
node transferTNT20.js privatenet 0x7D7e270b7E279C94b265A535CdbC00Eb62E6e68f 366 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 1111 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
```

## 3. TNT721 Token Transfers

Please run the following command to transfer TNT721 tokens between the mainchain and the subchain. The "authentic" TNT721 was deployed on the mainchain at address `0xEd8d61f42dC1E56aE992D333A4992C3796b22A74`:

```shell
cd $METACHAIN_GUIDE_ROOT
cd sdk/js

# Main Chain to Subchain Transfer (lock tokens on the mainchain):
node transferTNT721.js privatenet 0xEd8d61f42dC1E56aE992D333A4992C3796b22A74 360777 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 666 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop

# Subchain to Main Chain Transfer (burn vouchers on the subchain):
node transferTNT721.js privatenet 0xd5125d7bB9c4Fb222C522c4b1922cabC631E52D7 366 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 666 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
```

## 4. TNT1155 Token Transfers

Please run the following command to transfer TNT1155 tokens between the mainchain and the subchain. The "authentic" TNT1155 was deployed on the mainchain at address `0x47eb28D8139A188C5686EedE1E9D8EDE3Afdd543`:

```shell
cd $METACHAIN_GUIDE_ROOT
cd sdk/js

# Main Chain to Subchain Transfer (lock tokens on the mainchain):
node transferTNT1155.js privatenet 0x47eb28D8139A188C5686EedE1E9D8EDE3Afdd543 360777 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 123 88888 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop

# Subchain to Main Chain Transfer (burn vouchers on the subchain):
node transferTNT1155.js privatenet 0x0ede92cAc9161F6C397A604DE508Dcd1e6f43E61 366 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 123 1111 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
```