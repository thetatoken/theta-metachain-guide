# More on Subchain Validator Staking

In this step, we demonstrate some advanced features of Subchain validator staking. For example, we show that multiple stakers can stake to the same validator. The stakers can withdraw any amount of stake at any time, and claim the stake back after a pending period.

## Stake from Another Wallet

With the Main Chain walletnode running, we can execute the following command to transfer some TFUEL and Subchain governance token to another wallet.

```shell
SEQ=$(thetacli query account --address=0x2E833968E5bB786Ae419c4d13189fB081Cc43bab | grep sequence | grep -o -E '[0-9]+')
thetacli tx send --chain="testnet" --from=0x2E833968E5bB786Ae419c4d13189fB081Cc43bab --to=0x490ae30F584E778Fb5FbcAb6aC650692aaa45FbE --tfuel=100 --password=qwertyuiop --seq=$((SEQ+1))

node sendGovToken.js testnet 1000000000 0x490ae30F584E778Fb5FbcAb6aC650692aaa45FbE <PATH/TO/GOV_TOKEN_INIT_DISTRIBUTION_WALLET/KEYSTORE> <GOV_TOKEN_INIT_DISTRIBUTION_WALLET_PASSWORD>
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
