# More on Subchain Validator Staking

In this step, we demonstrate some advanced features of Subchain validator staking. For example, we show that multiple stakers can stake to the same validator. The stakers can withdraw any amount of stake at any time, and claim the stake back after a pending period. Moreover, the same staker can stake to multiple validators. 

## Stake from Another Wallet

With the Main Chain walletnode running, we can execute the following command to transfer some TFUEL and Subchain governance token to another wallet.

```shell
SEQ=$(thetacli query account --address=0x2E833968E5bB786Ae419c4d13189fB081Cc43bab | grep sequence | grep -o -E '[0-9]+')
thetacli tx send --chain="testnet" --from=0x2E833968E5bB786Ae419c4d13189fB081Cc43bab --to=0x490ae30F584E778Fb5FbcAb6aC650692aaa45FbE --tfuel=100 --password=qwertyuiop --seq=$((SEQ+1))

node sendGovToken.js testnet 1000000000 0x490ae30F584E778Fb5FbcAb6aC650692aaa45FbE <PATH/TO/ADMIN_WALLET_KEYSTORE_FILE> <ADMIN_WALLET_PASSWORD>
```

Now, deposit stake the Subchain validator from the new wallet `0x490ae30F584E778Fb5FbcAb6aC650692aaa45FbE`. Note that validator `0x2E833968E5bB786Ae419c4d13189fB081Cc43bab` already has a sufficient amount of wTHETA collateral and TFuel to support cross-chain transactions. Hence the new staker neither needs to deposit additional wTHETA collateral, nor needs to send TFuel to the validator.

```shell
cd $METACHAIN_GUIDE_ROOT
cd sdk/js

node depositStake.js testnet 10000000 <VALIDATOR_ADDRESS> 0 0 ~/.thetacli/keys/encrypted/490ae30F584E778Fb5FbcAb6aC650692aaa45FbE qwertyuiop
```

## Withdraw a Small Amount of Stakes Multiple Times

The stakers can withdraw any amount of stakes from the validators at any time. Note that when withrawing stakes, the staker needs to specify the amount of "shares" instead of the amount of governance token. The following command demonstrates that the new staker can withdraw small amounts of shares from the validator multiple times in a row.

```shell
cd $METACHAIN_GUIDE_ROOT
cd sdk/js

# withdraw 1000 wei Shares
node withdrawStake.js testnet 1000 <VALIDATOR_ADDRESS> ~/.thetacli/keys/encrypted/490ae30F584E778Fb5FbcAb6aC650692aaa45FbE qwertyuiop

# withdraw 2000 wei Shares
node withdrawStake.js testnet 2000 <VALIDATOR_ADDRESS> ~/.thetacli/keys/encrypted/490ae30F584E778Fb5FbcAb6aC650692aaa45FbE qwertyuiop

# withdraw 8888 wei Shares
node withdrawStake.js testnet 8888 <VALIDATOR_ADDRESS> ~/.thetacli/keys/encrypted/490ae30F584E778Fb5FbcAb6aC650692aaa45FbE qwertyuiop
```

## Claim the Stakes Back

There is a pending period between the stake withdrawal height and the block height when the withdrawn stake can be claimed back. In both the Testnet and Mainnet, the pending period is 70,000 blocks to ensure security. The pending withdrawn stakes are kept in a queue, and can be claimed back by the staker one at a time after the "stake return height" is reached. The "stake return height" of each withdrawal was printed by the `withdrawStake.js` script above.

After the "stake return heights" of the above withdrawn stakes are reached, use the following commands to claim the stakes back:

```shell
# claim the first withdrawn stake (i.e. the one correspond to 1000 wei Shares)
node claimStake.js testnet ~/.thetacli/keys/encrypted/490ae30F584E778Fb5FbcAb6aC650692aaa45FbE qwertyuiop

# claim the second withdrawn stake (i.e. the one correspond to 2000 wei Shares)
node claimStake.js testnet ~/.thetacli/keys/encrypted/490ae30F584E778Fb5FbcAb6aC650692aaa45FbE qwertyuiop

# claim the third withdrawn stake (i.e. the one correspond to 8888 wei Shares)
node claimStake.js testnet ~/.thetacli/keys/encrypted/490ae30F584E778Fb5FbcAb6aC650692aaa45FbE qwertyuiop
```

## Stake to Another Subchain Validator

One staker can stake to multiple Validators of a Subchain. First, start the second validator for the Subchain with the following commands:

```shell
# Open a new terminal and run the following commands
cd ~/metachain_playground/testnet/workspace
theta-eth-rpc-adaptor start --config=../subchain/ethrpc2

# Open yet another terminal and run the following commands
cd ~/metachain_playground/testnet/workspace
cp ../subchain/validator/snapshot ../subchain/validator2/
thetasubchain start --config=../subchain/validator2 --password=qwertyuiop
```

**Note**: If you are running the validator2 on a different machine, you'd need to update the p2p section of its `config.yaml` file as show below. You'd also need to update the firewall settings of the two nodes so their `p2p.port` are open to each other.

```yaml
p2p:
  # If the two validators are running on different machines, please make sure to configure firewall settings of the validators so 
  # the 121001 port of this node is open to all other validators.
  port: 12101

  # If the two validators are running on different machines, in the following line please specify the actual IP address 
  # of the first validator. It is recommended to include the ip_address:p2p_port of ALL the other validators in the seeds list, separated by commas.
  seeds: <IP_address_of_valiator_1>:12100
```

Wait until Validator2 to get in sync with Validator1. Then use the following command to stake to Validator2 from staker `<ADMIN_WALLET_ADDRESS>` and `0x490ae30F584E778Fb5FbcAb6aC650692aaa45FbE`. The address of Validator2 `<VALIDATOR2>` can be obtain from the auto-generated keystore file under `subchain/validator2/key/encrypted/`.

```shell
# Deposit stake with wTHETA collateral and intial fee
node depositStake.js testnet 100000000000000000000000 <VALIDATOR2> 1000000000000000000000 20000000000000000000000 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop

# Since the collateral and initial fee requirement have been satisfied, another staker can deposit stake without wTHETA collateral and intial fee
node depositStake.js testnet 10000000 <VALIDATOR2> 0 0 ~/.thetacli/keys/encrypted/490ae30F584E778Fb5FbcAb6aC650692aaa45FbE qwertyuiop
```

Valiator2 should start servicing as a validator for the Subchain when the next dynasty starts. After that, you can withdraw and claim part of the stakes from Validator2:

```shell
# Withdraw stake from Validator2
node withdrawStake.js testnet 7777 <VALIDATOR2> ~/.thetacli/keys/encrypted/490ae30F584E778Fb5FbcAb6aC650692aaa45FbE qwertyuiop

# Wait until the return height, and claim the governance tokens back
node claimStake.js testnet ~/.thetacli/keys/encrypted/490ae30F584E778Fb5FbcAb6aC650692aaa45FbE qwertyuiop
```

