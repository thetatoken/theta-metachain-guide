# Launch a Subchain

This document gives an overview on how to launch a subchain. At a high level, it consists of the following steps:

* **Preparation**: The subchain operator needs to reserve an EVM chainID, prepare a sufficient amount of wTHETA which will be used as collateral for the subchain, generate the private/public key pairs for the initial set of subchain validators, and create the genesis snapshot for the subchain.

* **Governance Token Generation**: Each subchain needs its own governance token, which is a TNT20 token deployed on the **Main Chain**. The The subchain operator needs to deploy the governance token.

* **Subchain Registration**: In this step, the subchain operator registers the subchain through a smart contract on the **Main Chain**. 10,000 wTHETA are required as the security collateral for the registeration.

* **Setup the Initial Validators**: In this step, the subchain operator deposits wTHETA collateral and stakes an appropriate amount of governance tokens to each of the intial validators. 1,000 wTHETA are required as the security collateral for each subchain validator. 1,000 wTHETA are required as the collateral for *each* Subchain validator (in addition to the 10,000 wTHETA required for the Subchain registration). The validator operator can withdraw the wTHEAT collateral later. **However, note that the wTHETA collateral is withdrawable only when the validator is inactive, meaning no government token is staked to this validator. If there is any govenment token staked against the validator, the smart contract won't allow the wTHETA collateral withdrawal.** This is by design for better security of the subchain.
The subchain operator also needs to prepare some TFuel for the validators, since the validator burns TFuel for cross-chain transfers. Each subchain validator on the Mainnet requires 20,000 TFuel as the initial reserve. Each cross-chain transfer will charge the sender 10 TFuel as the cross-chain fee. The fee will be split among the validators to cover the TFuel burn cost.

* **Start the Initial Validators**: In this step, the subchain operator starts the initial set of Subchain validators, which should start producing blocks.
  
* **Add/Remove Validators**: After the initial launch, it is possible to add new validators for a subchain, and remove existing validators on a on-going basis.

Below we provide more detailed explainations for each individual steps. To see these steps in action, please check out the Metachain guides for the [local Privatenet](../1-privatenet/), the [Testnet](../2-testnet/), and the [Mainnet](../3-mainnet/).

## Step 1. Preparation

* For lauching a subchain for the Mainnet and Testnet, the subchain operator reserves an EVM `chainID` on [chainlist.org](https://chainlist.org/). The `chainID` needs to be larger than 1000 and different from all registered subchain EVM `chainIDs` to avoid conflicts, otherwise the Subchain Registrar contract will reject the `chainID`. Note that you do NOT need to reseve the `chainID` for the Privatenet. This is because the Privatenet is running in a local environment, and hence the EVM `chainID` it uses won't conflict with other Subchain projects.

* The subchain operator wraps a sufficient amount of native THETA tokens into wTHETA tokens (at least 14,000 wTHETA). This can be done using the [Theta Web Wallet](https://wallet.thetatoken.org/). Please check out [this link](https://medium.com/theta-network/theta-v3-4-0-b51aa819a20d) to learn more.

* The subchain operator generates the private/public key pairs for the set of initial validators. This can be done using the [Theta Web Wallet](https://wallet.thetatoken.org/create), or any other method that can generate Ethereum compatibile enccrypted keystore files.

* The subchain operator generates the genesis snapshot with the initial validator set and their stake amount using the `subchain_generate_genesis` tool we provide.

* Record the genesis hash from the genesis generation output

## Step 2. Governance Token Setup

* The subchain operator deploys a TNT20 token as the subchain governance token. Here is an [example implementation](../../demos/subchain-governance-token/contracts/SubchainGovernanceToken.sol) of the governance token. This reference implmentation allows token inflation to reward the subchain validators. The inflation rate can be set via the `stakerRewardPerBlock_` parameter in the contract constructor. The inflation rate can be updated using the `updateStakerRewardPerBlock()` method. The subchain operators can implement their own version of the governance token. However, to reward the Subchain validator stakers, the SubchainGovernanceToken needs to implement the following two methods to allow the ValidatorStakeManager contract to mint new tokens for the stakers. In addition, the SubchainGovernanceToken needs to set the `minter` to the address of the `ValidatorStakeManager` contract:
   - `function mintStakerReward(address account, uint256 amount) external minterOnly returns (bool)`
   - `function stakerRewardPerBlock() external view returns (uint256)`

## Step 3. Subchain Registration

In this step, the subchain operator registers a subchain through a smart contract on the **Main Chain**. 10,000 wTHETA are required as the security collateral for the registeration. This step can be broken down into:

* The subchain operator approves the `ChainRegistrarOnMainchain` contract to allow the contract to transfer a sufficient amount of Subchain Governance tokens from the operator’s wallet (for subchain collateral)

* The subchain operator approves the `ValidatorCollateralManager` contract to allow the contract to transfer a sufficient amount of wTheta from the operator's wallet (for validator collateral)

* The subchain operator registers the subchain through the `ChainRegistrarOnMainchain` contract, which registers the `chainID` and transfers required amount of wTheta collateral from the operator’s wallet

* Call the following smart contract method to register the subchain: `ChainRegistrarOnMainchain.registerSubchain(chainID, govTokenAddr, wThetaAmount, genesisHash)`

## Step 4. Setup the Initial Validators

* The subchain operator deposits Theta collaterals to the initial set of validators through the following smart contract call: `ChainRegistrarOnMainchain.depositCollateral(chainID, validatorAddr, wThetaAmount)`

* The subchain operator approves the `ValidatorStakeManager` contract so it is able to transfer sufficient amount of governance TNT20 token from its staking wallets

* The subchain operator deposits Subchain Governance tokens to the initial set of validators based on the initial stake recorded in the genesis snapshot:
`ChainRegistrarOnMainchain.depositStake(chainID, validatorAddr, amount)`

## Step 5. Start the Initial Validators

* The subchain operator starts the initial validators

## Step 6. Add/Remove Validators

* The subchain validator operators and/or community members withdraw/deposit stakes to/from more validator nodes through the following smart contract calls
    - `RegiChainRegistrarOnMainchainstrar.depositCollateral(chainID, validatorAddr, amount)`
    - `ChainRegistrarOnMainchain.depositStake(chainID, validatorAddr, amount)`
    - `ChainRegistrarOnMainchain.withdrawStake(chainID, validatorAddr, amount)`
    - `ChainRegistrarOnMainchain.withdrawCollateral(chainID, validatorAddr, wThetaAmount)`

**Note 1**: In the initial dynasty, please deposit stakes only to the initial validators hardcoded in the genesis snapshot. A dynasty on both the Mainnet and Testnet consists of 10,000 blocks on the **Main Chain** (NOT the subchain). For example, dynasty 1888 starts from Main chain block height 18,880,000, and ends at height 18,889,999. On the Privatenet, we set the dynasty to a much shorter duration (400 Main Chain blocks) to allow faster experimentation and development.

**Note 2**: Stake deposit/withdrawal takes effect only after the next dynasty starts. For example, if the current Main Chain block height is 18,880,765, and someone deposits stake to a new node **V1** for a subchain, then **V1** will serve as a validator for the subchain starting from block height 18,890,000.

## Step 7. Test Cross-Chain Asset Transfers.

We have provided a JS SDK to facilitate cross-chain asset transfers. Please check out the [Privatenet example](../1-privatenet/manual-flow/3-cross-chain-asset-transfers.md) for more details.

**Note 1**: If a token contact `X` is deployed on the chain A (chain A could be either the Main Chain or a Subchain), we call the `X` tokens on chain A the "authentic tokens". When Alice transfer token `X` from chain A to chain B, she essentially locks token `X` on chain A and mint "voucher tokens" `vX` on chain B. Then on chain B, Alice can burn voucher tokens `vX` to recover the corresponding authentic tokens `X` on chain A.

**Note 2**: The output of asset transfer JS SDK may contain terms like "source chain" and "target chain". Below we explain what these terms mean:
* **Source chain**: The chain on which the user action ("token lock" or "voucher burn") is initiated.
    *  Example 1: Assume token `X` was deployed on chain A. User Alice locked token `X` on chain A in order to transfer the token to chain B. In this scenario, chain A is the source chain since the "token lock" user action happened on chain A. On the other hand, chain B is the target chain.
    *  Example 2: Say Alice burned voucher tokens `vX` on chain B to unlock the authentic token `X` on chain A. In this case, chain B is the source chain since the "voucher burn" user action was initiated on chain B. On the other hand, chain A is the target chain.
* **TargetChain**: The chain to which the validators relays the user action.
    *  In the above example 1, chain B is the target chain.
    *  In the above example 2, chain A is the target chain.


## Step 8 (Optional): Add Your Subchain to the Official Theta Wallet/Explorer

* Please contact the Theta Labs (support@thetalabs.org) for more details.


## Next

Please check out the Metachain guides for the [local Privatenet](../1-privatenet/), the [Testnet](../2-testnet/), and the [Mainnet](../3-mainnet/).
