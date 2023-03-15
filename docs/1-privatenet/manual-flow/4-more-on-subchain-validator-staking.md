# More on Subchain Validator Staking

In this step, we demonstrate advanced features of Subchain validator staking. For example, we show that multiple stakers can stake to the same validator. The stakers can withdraw any amount at any time, and claim the stake back after a pending period. Moreover, the same staker can stake to multiple validators. 

## Stake from Another Wallet

Execute the following command to transfer some TFUEL and Subchain governance token to another wallet.

```shell
SEQ=$(thetacli query account --address=0x2E833968E5bB786Ae419c4d13189fB081Cc43bab | grep sequence | grep -o -E '[0-9]+')
thetacli tx send --chain="privatenet" --from=0x2E833968E5bB786Ae419c4d13189fB081Cc43bab --to=0x490ae30F584E778Fb5FbcAb6aC650692aaa45FbE --tfuel=100 --password=qwertyuiop --seq=$((SEQ+1))

node sendGovToken.js privatenet 0x7ad6cea2bc3162e30a3c98d84f821b3233c22647 1000000000 0x490ae30F584E778Fb5FbcAb6aC650692aaa45FbE ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop
```

Now, deposit stake the Subchain validator from the new wallet `0x490ae30F584E778Fb5FbcAb6aC650692aaa45FbE`. Note that validator `0x2E833968E5bB786Ae419c4d13189fB081Cc43bab` already has a sufficient amount of wTHETA collateral and TFuel to support cross-chain transactions. Hence the new staker neither needs to deposit additional wTHETA collateral, nor needs to send TFuel to the validator.

```shell
cd $METACHAIN_GUIDE_ROOT
cd sdk/js

node depositStake.js privatenet 10000000 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 0 0 ~/.thetacli/keys/encrypted/490ae30F584E778Fb5FbcAb6aC650692aaa45FbE qwertyuiop
```

## Withdraw a Small Amount of Stakes Multiple Times

The stakers can withdraw any amount of stakes from the validators at any time. Note that when withrawing stakes, the staker needs to specify the amount of "shares" instead of the amount of governance token. The following command demonstrates that the new staker can withdraw small amounts of shares from the validator multiple times in a row.

```shell
cd $METACHAIN_GUIDE_ROOT
cd sdk/js

# withdraw 1000 wei Shares
node withdrawStake.js privatenet 1000 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab ~/.thetacli/keys/encrypted/490ae30F584E778Fb5FbcAb6aC650692aaa45FbE qwertyuiop

# withdraw 2000 wei Shares
node withdrawStake.js privatenet 2000 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab ~/.thetacli/keys/encrypted/490ae30F584E778Fb5FbcAb6aC650692aaa45FbE qwertyuiop

# withdraw 8888 wei Shares
node withdrawStake.js privatenet 8888 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab ~/.thetacli/keys/encrypted/490ae30F584E778Fb5FbcAb6aC650692aaa45FbE qwertyuiop
```

## Claim the Stakes Back

There is a pending period between the stake withdrawal height and the block height when the withdrawn stake can be claimed back. In both the Testnet and Mainnet, the pending period is 70,000 blocks to ensure security. In the Privatenet setup, the pending period is set to 200 block to facilitate fast experimentation. The pending withdrawn stakes are kept in a queue, and can be claimed back by the staker one at a time after the "stake return height" is reached. The "stake return height" of each withdrawal was printed by the `withdrawStake.js` script above.

After the "stake return heights" of the above withdrawn stakes are reached, use the following commands to claim the stakes back:

```shell
# claim the first withdrawn stake (i.e. the one correspond to 1000 wei Shares)
node claimStake.js privatenet ~/.thetacli/keys/encrypted/490ae30F584E778Fb5FbcAb6aC650692aaa45FbE qwertyuiop

# claim the second withdrawn stake (i.e. the one correspond to 2000 wei Shares)
node claimStake.js privatenet ~/.thetacli/keys/encrypted/490ae30F584E778Fb5FbcAb6aC650692aaa45FbE qwertyuiop

# claim the third withdrawn stake (i.e. the one correspond to 8888 wei Shares)
node claimStake.js privatenet ~/.thetacli/keys/encrypted/490ae30F584E778Fb5FbcAb6aC650692aaa45FbE qwertyuiop
```

## Stake to Another Subchain Validator

One staker can stake to multiple Validators of a Subchain. First, start the second validator for the Subchain with the following commands:

```shell
# Open a new terminal and run the following commands
cd ~/metachain_playground/privatenet/workspace
theta-eth-rpc-adaptor start --config=../subchain/ethrpc2

# Open yet another terminal and run the following commands
cd ~/metachain_playground/privatenet/workspace
thetasubchain start --config=../subchain/validator2 --password=qwertyuiop
```

Wait until Validator2 `0x6226992905016b8Ce1B35c0c46D5cc17E4706941` to get in sync with Validator1. Then use the following command to stake to Validator2 from staker `0x2E833968E5bB786Ae419c4d13189fB081Cc43bab` and `0x490ae30F584E778Fb5FbcAb6aC650692aaa45FbE`:

```shell
# Deposit stake with wTHETA collateral and intial fee
node depositStake.js privatenet 100000000000000000000000 0x6226992905016b8Ce1B35c0c46D5cc17E4706941 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop

# Since the collateral and initial fee requirement have been satisfied, another staker can deposit stake without wTHETA collateral and intial fee
node depositStake.js privatenet 10000000 0x6226992905016b8Ce1B35c0c46D5cc17E4706941 0 0 ~/.thetacli/keys/encrypted/490ae30F584E778Fb5FbcAb6aC650692aaa45FbE qwertyuiop
```

Valiator2 should start servicing as a validator for the Subchain when the next dynasty starts. After that, you can withdraw and claim part of the stakes from Validator2:

```shell
# Withdraw stake from Validator2
node withdrawStake.js privatenet 7777 0x6226992905016b8Ce1B35c0c46D5cc17E4706941 ~/.thetacli/keys/encrypted/490ae30F584E778Fb5FbcAb6aC650692aaa45FbE qwertyuiop

# Wait until the return height, and claim the governance tokens back
node claimStake.js privatenet ~/.thetacli/keys/encrypted/490ae30F584E778Fb5FbcAb6aC650692aaa45FbE qwertyuiop
```

