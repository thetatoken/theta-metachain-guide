
# Subchain Registration and Staking


The snapshot file we prepared for the Main Chain already includes the following smart contracts deployed at the following addresses:

```shell
MockWrappedTheta          : 0x7d73424a8256C0b2BA245e5d5a3De8820E45F390
ChainRegistrarOnMainchain : 0x08425D9Df219f93d5763c3e85204cb5B4cE33aAa
```

Through the `ChainRegistrarOnMainchain` smart contract, the subchain operator can register a subchain, and stake to the validators of that subchain. Also for simplicity, we have configured the Privatenet environment to use `MockWrappedTheta` tokens instead of the real `wTHETA` tokens as the subchain collaterals. On the Testnet and the Mainnet, we'd need to use the real `wTHETA` tokens as the subchain collaterals.


## 1. Start the Main Chain Validator and the ETH RPC Adapter

Execute the following commands to start the Main Chain validator:

```shell
cd ~/metachain_playground/privatenet/workspace
theta start --config=../mainchain/validator --password=qwertyuiop
```

It could take about 30-60 seconds for the Main Chain validator to finalize the first block. After that it should produce and finalize a block every 6 seconds or so. The Main Chain validator should print `Notified finalized block, height=xxx` on the screen. **After** the Main Chain validator starts producing new blocks, run the following command in *another terminal*:

```shell
cd ~/metachain_playground/privatenet/workspace
theta-eth-rpc-adaptor start --config=../mainchain/ethrpc
```

The Main Chain and Subchain nodes communicate primarily through the ETH RPC interface. That's why in the Privatenet setup, we run two ETH RPC adapters, one for the Main Chain validator, and the other for the Subchain validator. Please see Figure 3 in the [Theta Metachain Whitepaper](https://assets.thetatoken.org/theta-mainnet-4-whitepaper.pdf) for more details.

## 2. Deploy the Governance Token for the Subchain

Run the following commands to deploy the Governance token for the subchain. Note:

* Here we use the [reference implementation](../../../demos/subchain-governance-token/contracts/SubchainGovernanceToken.sol) of the Subchain Governance token. If you want to implement your own token, please replace with [this file](../../../sdk/contracts/SubchainGovernanceToken.json) with the compiled contract before running the following commands.

* If you want to use your own imlementation, please compile your solidity source code, and replace this [SubchainGovernanceToken.json](../../../sdk/contracts/SubchainGovernanceToken.json) with the compiler output.

* In the command below, "Subchain 360777 Gov" and `GOV360777` are the name and symbol of the Gorvenance token. Please feel free to change them if you want to.

```shell
cd $METACHAIN_GUIDE_ROOT
cd sdk/js

node deployGovToken.js privatenet "Subchain 360777 Gov" GOV360777 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
```

The script output should look similar to:

```
...
------ Subchain Governance Token Details ------
Address  : 0x7ad6cea2bc3162e30a3c98d84f821b3233c22647
Name     : Subchain 360777 Gov
Symbol   : GOV360777
Decimals : 18
StakerRewardPerBlock : 2000000000000000000
Init distr wallet    : 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab
Balance of init distr wallet: 500000000000000000000000000
-----------------------------------------------
```

**Important**: Then, update `PrivatenetConfigs.govTokenContractAddr` in [configs.js](../../../sdk/js/configs.js) with the Gov token address printed above.


## 3. Register a New Subchain

Now, run the following script to mint some `MockWrappedTheta` tokens which will later be used as the collaterals for the subchain and the validators.

```shell
cd $METACHAIN_GUIDE_ROOT
cd sdk/js

node mintMockWrappedTheta.js privatenet 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 50000000000000000000000 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
```

The above script should output the hash of the minting transaction. You can use `thetacli query tx --hash=<TX_HASH>` to query the status of the transaction. Make sure the transaction was finalized without errors.

Next, register the subchain using the following command. Note that 

* In the following command, replace 0x9fd6c9a45e4c9eb7ed3424f92e58ce4103f3844f04e967f91e38894e4900fbf5 with the actual "Genesis block hash" if you created the genesis snapshot yourself

* If you created the genesis snapshot with a subchainIDStr different than the default `tsub360777`, you would need to update `PrivatenetConfigs.subchainID` and `PrivatenetConfigs.subchainIDStr` in [configs.js](../../../sdk/js/configs.js) accordingly. Note that since the Privatenet is just running in the local environment, you do not need to register the EVM `chainID` on [chainlist.org](https://chainlist.org/).

```shell
cd $METACHAIN_GUIDE_ROOT
cd sdk/js

node registerSubchain.js privatenet 0x9fd6c9a45e4c9eb7ed3424f92e58ce4103f3844f04e967f91e38894e4900fbf5 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
```

The script prints all registered subchains before and after the registration transaction. The output should look similar to:

```shell
...

Registering suchain 360777
Subchain registration tx:  0xe3d64770ff8a7f3a27b2e9c086cfa9fe433545002a41435990b78884158c140a

All registered subchains:
Subchain, ID: 360777, metadata: 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab,10000000000000000000000,0x7ad6cEA2BC3162E30A3C98d84f821b3233C22647,0x9fd6c9a45e4c9eb7ed3424f92e58ce4103f3844f04e967f91e38894e4900fbf5,106,true

```

## 4. Stake to a New Validator

```shell
cd $METACHAIN_GUIDE_ROOT
cd sdk/js

node depositStake.js privatenet 100000000000000000000000 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
```

The script should print out something like this. Make sure the `ValidatorSet` for the next dynasty match with the initial validator set specified in `INIT_VALIDATOR_SET.json` (see [here](./1-setup.md#15-optional-generate-a-genesis-snapshot-for-your-privatenet-subchain)).

```shell
...

After staking, ValidatorSet for the next dyansty 1:
validator: 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab, shareAmount: 100000000000000000000000
```

## 5. Run the Subchain validator and the ETH RPC Adapter

After the above staking transaction is finalized, we can start the Subchain Validator and its ETH RPC adapter in two new terminals. We need start the subchain ETH RPC adapter **before** starting the subchain validator. This order is important.

```shell
cd ~/metachain_playground/privatenet/workspace
theta-eth-rpc-adaptor start --config=../subchain/ethrpc

cd ~/metachain_playground/privatenet/workspace
thetasubchain start --config=../subchain/validator --password=qwertyuiop

```

If the Subchain starts finalizing blocks, congratulations! You have succuessfully configured and launched a local Metachain Privatenet! The Subchian validator should produce and finalize a block every second, which is much faster than the Main Chain. Next, you can use the JS SDK we provide to send digital assets (TFuel, TNT20/721/1155 tokens) between the Main Chain and the Subchain, which also serve as good sanity checks regarding whether the Subchain is functioning correctly.

## Next

Please proceed to the next step ["Cross-Chain Asset Transfers"](./3-cross-chain-asset-transfers.md).
