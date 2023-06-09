
# Subchain Registration and Staking


We have deployed the Wrapped Theta (`wTHETA`) token and the `ChainRegistrarOnMainchain` contract on the Main Chain of the Theta Testnet at the following addresses:

```shell
WrappedTheta              : 0x90e6ca1087a2340da858069cb8d78d595e4ac798
ChainRegistrarOnMainchain : 0x01Cb3B1D61E8E833FbC520370d02477e0f07a405
```

Through the `ChainRegistrarOnMainchain` smart contract, the subchain operator can register a subchain, and stake to the validators of that subchain. On the Testnet and the Mainnet, we'd need to use the real `wTHETA` tokens as the subchain collaterals. You can wrap the native Theta into `wTHETA` [through the Theta Web Wallet](https://medium.com/theta-network/theta-v3-4-0-b51aa819a20d). If you are a developer and needs the native Theta on the Testnet for subchain development, please contact us at support@thetalabs.org.


## 1. Start the Main Chain node and its ETH RPC Adapter

Execute the following commands to start the Main Chain node:

```shell
mkdir -p ~/metachain_playground/testnet/workspace
cd ~/metachain_playground/testnet/workspace
theta start --config=../mainchain/walletnode --password=<YOUR_MAIN_CHAIN_NODE_PASSWORD>
```

Wait until the Main Chain walletnode gets insync with the network. This may take some time (e.g. 30-60 mins). You can run the following command to check its synchronization status. If in the output says `"syncing": false` it means the node is synced to the latest block.

```shell
thetacli query status
```

**After** the Main Chain walletnode is in-sync with the network, run the following command in *another terminal*:

```shell
cd ~/metachain_playground/testnet/workspace
theta-eth-rpc-adaptor start --config=../mainchain/ethrpc
```

## 2. Deploy the Governance Token for the Subchain

Run the following commands to deploy the Governance token for the subchain. Note:

* Here we use the [reference implementation](../../../demos/subchain-governance-token/contracts/SubchainGovernanceToken.sol) of the Subchain Governance token. If you want to implement your own token, please replace with [this file](../../../sdk/contracts/SubchainGovernanceToken.json) with the compiled contract before running the following commands.

* If you want to use your own imlementation, please compile your solidity source code, and replace this [SubchainGovernanceToken.json](../../../sdk/contracts/SubchainGovernanceToken.json) with the compiler output.

* The command below uses the `<ADMIN_WALLET_ADDRESS>` as the wallet to hold the initial token distribution. You can specify a different wallet if you want to.

```shell
cd $METACHAIN_GUIDE_ROOT
cd sdk/js

node deployGovToken.js testnet <GOV_TOKEN_NAME> <GOV_TOKEN_SYMBOL> <SUBCHAIN_ADMIN_ADDRESS> <ADMIN_WALLET_ADDRESS> <PATH/TO/ADMIN_WALLET_KEYSTORE_FILE> <ADMIN_WALLET_PASSWORD>
```

The command should print out something similar to the following, which includes the address of the Governance token contract deployed on the Main Chain:

```
...
------ Subchain Governance Token Details ------
Address  : 0xXXXX
Name     : XXXX
Symbol   : XXXX
Decimals : 18
StakerRewardPerBlock : XXXXX
Init distr wallet    : 0xXXXXX
Balance of init distr wallet: XXXXXX
-----------------------------------------------
```

Then, update `testnetConfigs.govTokenContractAddr` in [configs.js](../../sdk/js/configs.js) with the Gov token address printed by the above command.

## 2. Register a New Subchain

First, please setup an admin wallet. You can generate it using the `thetacli key new` command or through the [Theta Web Wallet](https://wallet.thetatoken.org/unlock/keystore-file). If you generate the wallet using `thetacli key new`, it will automatically place the keystore file under `~/.thetacli/keys/encrypted/`. If you generate the key using the Theta Web Wallet, please copy the keystore file to the same folder.

Next, send 14,000 native Testnet Theta and some TFuel to your admin wallet. The Theta will essentially be used as the collateral for the subchain. You'd need to wrap the native Theta into `wTHETA` tokens first. To do this, you can import the admin wallet keystore file to the [Theta Web Wallet](https://wallet.thetatoken.org/unlock/keystore-file) and use it to wrap native Theta inoto `wTHETA`. The TFuel are for two purposes: 1) use as the gas fee since the admin wallet needs to interact smart contracts; 2) on the testnet, the admin wallet needs to send 20,000 TFuel to **each** validator since the validators need to burn gas for cross-chain transactions. Say you have 4 initial validators, the admin wallet would need to have at least 85,000 TFuel to get the Subchain up and running.

With sufficient amount of `wTHETA` and TFuel in the admin wallet, you can register the subchain using the following command. Note that: 

* In the following command, replace `<GENESIS_BLOCK_HASH>` with the actual "Genesis block hash" you obtained when you created the genesis snapshot using the `subchain_generate_genesis` tool

* Before running the command, please edit this [config.js](../../../sdk/js/configs.js) file to update `TestnetConfigs.subchainID` with the EVM `chainID` you reserved for your subchain, on [chainlist.org](https://chainlist.org/).
  
* Please also edit [config.js](../../../sdk/js/configs.js) file to update `TestnetConfigs.subchainIDStr` with the `string` version of the subchainID, which is in the form of `tsub[EVM_chainID]`. For example, if your EVM `chainID` is `360123456`, then the `TestnetConfigs.subchainIDStr` can be set to `tsub360123456`. 

```shell
cd $METACHAIN_GUIDE_ROOT
cd sdk/js

node registerSubchain.js testnet <GENESIS_BLOCK_HASH> <PATH/TO/ADMIN_WALLET_KEYSTORE_FILE> <ADMIN_WALLET_PASSWORD>
```

The above script should print out the tx hash of the registration transaction, as well as the registered subchains before and after the transaction. Please make sure your chain is registered properly. If it is not included in the registered chain list, you can search your the registration transaction with the tx hash on the [Theta Testnet explorer](https://testnet-explorer.thetatoken.org/) and see why it failed.

## 4. Stake to a New Validator

Run the following command to stake to your validator(s), the specified `<INIT_STAKE_AMOUNT>` and `<VALIDATOR_ADDRESS>` need to match the values in the `INIT_VALIDATOR_SET.json` when you created the genesis snapshot. If you have multiple validators, you'd need to run this command for each individual validator.

```shell
node depositStake.js testnet <INIT_STAKE_AMOUNT> <VALIDATOR_ADDRESS> <PATH/TO/ADMIN_WALLET_KEYSTORE_FILE> <ADMIN_WALLET_PASSWORD>
```

The script prints out the ValidatorSet of the next dynasty. Make sure your validators are included. If not, please search with the tx hash on the [Theta Testnet explorer](https://testnet-explorer.thetatoken.org/) and see why it failed. A possible cause is that the admin wallet does not have sufficient amount of wTHETA and TFuel (least 14,000 wTHETA and 85,000 TFuel are required). 

## 5. Run the Subchain validator and the ETH RPC Adapter

After the above staking transaction is finalized, we can start the ETH RPC adapter and the Subchain Validator. We need start the subchain ETH RPC adapter **before** starting the subchain validator. This order is important.

```shell
cd ~/metachain_playground/testnet/workspace
theta-eth-rpc-adaptor start --config=../subchain/ethrpc
```

Next, please place the keystore file of your subchain validator (i.e. the keystore file corresponds to`<VALIDATOR_ADDRESS>` you specified above) under `~/metachain_playground/testnet/subchain/validator/key/encrypted/`. Then, run the following command to start the validator:


```
cd ~/metachain_playground/testnet/workspace
thetasubchain start --config=../subchain/validator --password=<VALIDATOR_PASSWORD>
```

If the Subchain starts finalizing blocks, congratulations! You have succuessfully configured and launched a Subchain for the Metachain Testnet! The Subchian validator should produce and finalize a block every second, which is much faster than the Main Chain. Next, you can use the JS SDK we provide to send digital assets (TFuel, TNT20/721/1155 tokens) between the Main Chain and the Subchain, which also serve as good sanity checks regarding whether the Subchain is functioning correctly.

## Next

Please proceed to the next step ["Cross-Chain Asset Transfers"](./3-cross-chain-asset-transfers.md).
