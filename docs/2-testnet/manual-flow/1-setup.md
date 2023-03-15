# Setup for the Testnet Environment

## 1. Setup (Run once)

First, please make sure the following software are installed on your machine:
 - [Golang](https://go.dev/dl/) 1.14 or higher version. Also please make sure Golang related env variables like `$GOPATH` are set properly. 
 - The [Truffle suite](https://trufflesuite.com/docs/truffle/getting-started/installation/) for smart contract compilation and deployment

### 1.1 Compile the Theta binaries

Compile the Theta binaries from source code:

```shell
# Make sure your $GOPATH env variable is set properly below running the following commands
mkdir -p $GOPATH/src/github.com/thetatoken

git clone https://github.com/thetatoken/theta-protocol-ledger.git $GOPATH/src/github.com/thetatoken/theta
export THETA_HOME=$GOPATH/src/github.com/thetatoken/theta
cd $THETA_HOME
git checkout sc-privatenet
git pull origin sc-privatenet
export GO111MODULE=on
make install
```

### 1.2 Compile the ETH RPC Adapter binary

Compile the ETH RPC Adapter binary from source code:

```shell
cd $GOPATH/src/github.com/thetatoken
git clone https://github.com/thetatoken/theta-eth-rpc-adaptor
export THETA_ETH_RPC_ADAPTOR_HOME=$GOPATH/src/github.com/thetatoken/theta-eth-rpc-adaptor
cd $THETA_ETH_RPC_ADAPTOR_HOME
git checkout main
git pull origin main
export GO111MODULE=on
make install
```

### 1.3 Compile the Subchain binaries

Compile the subchain binaries from source code:

```shell
git clone https://github.com/thetatoken/theta-protocol-subchain.git $GOPATH/src/github.com/thetatoken/thetasubchain
export SUBCHAIN_HOME=$GOPATH/src/github.com/thetatoken/thetasubchain
cd $SUBCHAIN_HOME
git checkout master
git pull origin master
​export GO111MODULE=on
make install
```

### 1.4 Setup the Workspace for the Testnet Environment

Run the following commands to setup the workspace:

```shell
cd ~
mkdir -p metachain_playground
mkdir -p metachain_playground/testnet
mkdir -p metachain_playground/testnet/workspace

# skip the following command if you have cloned this repo earlier
cd ~/metachain_playground/
git clone https://github.com/thetatoken/theta-metachain-guide
cd theta-metachain-guide
export METACHAIN_GUIDE_ROOT=`pwd`
cd sdk/js
npm install

mkdir -p ~/.thetacli/keys/encrypted/
cp keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab ~/.thetacli/keys/encrypted/
```

Next, copy over the configs for both the Main Chain and the Subchain:

```shell
cd $METACHAIN_GUIDE_ROOT
rm -rf ~/metachain_playground/testnet/mainchain
rm -rf ~/metachain_playground/testnet/subchain
cp -r sdk/configs/testnet/* ~/metachain_playground/testnet/
```

Then, download the latest snapshot of the Testnet Main Chain.

```shell
cd ~/metachain_playground/testnet/mainchain/walletnode
wget -O ./snapshot https://theta-testnet-backup.s3.amazonaws.com/snapshot/snapshot
```

### 1.5 Generate a Genesis Snapshot for Your Testnet Subchain

For the Testnet environment, you would need to generate a genesis snapshot for your subchain. You can generate the snapshot yourself with the following command:

``` shell
cd ~/metachain_playground/testnet/subchain/validator
subchain_generate_genesis -mainchainID=testnet -subchainID=<SUBCHAIN_ID_STR> -initValidatorSet=<PATH/TO/INIT_VALIDATOR_SET.json> -admin=<SUBCHAIN_ADMIN_ADDRESS> -fallbackReceiver=<SUBCHAIN_ADMIN_ADDRESS> -genesis=./snapshot
```

**Notes**:

* `SUBCHAIN_ID_STR` needs to be in the following format: "tsub[subchainID]". Here `subchainID` is the EVM `chainID`, which is an integer no smaller than 1000. For example, assuming your EVM `chainID` is `98123`, then `SUBCHAIN_ID_STR` should be `tsub98123`. Also, since the Testnet Main Chain is shared among multiple subchain, you need to make sure the `SUBCHAIN_ID_STR` you chose has not been registered before. To check if the EVM `chainID` has been registered, please query this method `ChainRegistrarOnMainchain.isARegisteredSubchain(uint256 subchainID) returns (bool)` with your EVM `chainID`. The address of `ChainRegistrarOnMainchain` contract on the Testnet Main Chain is `0x7b5F6232b8edDbe8281111Cf3A2A66f02EE384cD`.

* The `SUBCHAIN_ADMIN_ADDRESS` is an admin address for the subchain with limited previledge. For example, one of its admin capability is to change the cross-chain transfer fee.

* The `INIT_VALIDATOR_SET.json` JSON file specifies the initial set of validators and their initial stakes. The file format is listed below. For better security, it is recommended that **the total amount of initial stake is at least 30% of the entire initial circulation supply of the Subchain Governance token**. For example, say the Subchain has 4 initial validators, and the initial supply of the Governance token is 100,000,000 x 10^18. Then, it is recommended that the total amount of Governance tokens staked to these 4 validators is at least 30,000,000 x 10^18.

```shell
# The content of INIT_VALIDATOR_SET.json
[
    {
        "address": "<INIT_VALIDATOR_ADDR_1>",
        "stake": "<AMOUNT_OF_STAKE_FOR_VALIDATOR_1>"
    },
    {
        "address": "<INIT_VALIDATOR_ADDR_2>",
        "stake": "<AMOUNT_OF_STAKE_FOR_VALIDATOR_2>"
    },
    
    ...

    {
        "address": "<INIT_VALIDATOR_ADDR_n>",
        "stake": "<AMOUNT_OF_STAKE_FOR_VALIDATOR_n>"
    }
]
```

For example, you can generate the genesis snapshot for Subchain `tsub360777` using the following commands (**Note**: this is just an example. Do **NOT** copy these commands to generate the snapshot for your Testnet Subchain).

```shell
cd ~/metachain_playground/testnet/subchain/validator
rm -rf ./db
rm -rf ./snapshot
subchain_generate_genesis -mainchainID=testnet -subchainID=tsub360777 -initValidatorSet=./data/init_validator_set.json -admin=0x2E833968E5bB786Ae419c4d13189fB081Cc43bab -fallbackReceiver=0x2E833968E5bB786Ae419c4d13189fB081Cc43bab -genesis=./snapshot
```

The above command prints out some important information about the subchain, including the initial set of validators, the token bank contract adresses on the subchain, etc. It also prints out the **Genesis block hash** as shown below. You need to edit this config file `~/metachain_playground/testnet/subchain/validator/config.yaml` and update `genesis.hash` with this hash. Otherwise the subchain will not be able to import the newly generated snapshot.

```

INFO[0000] -------------------------------------------------------------------------------  prefix=genesis
INFO[0000] Cross-chain fee setter: 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab  prefix=genesis
INFO[0000] Initial Validator: 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab, Stake: 100000000000000000000000  prefix=genesis
INFO[0000] Chain Registrar    Contract Address: 0xBd770416a3345F91E4B34576cb804a576fa48EB1  prefix=genesis
INFO[0000] TFuel   Token Bank Contract Address: 0x5a443704dd4B594B382c22a083e2BD3090A6feF3  prefix=genesis
INFO[0000] TNT20   Token Bank Contract Address: 0x47e9Fbef8C83A1714F1951F142132E6e90F5fa5D  prefix=genesis
INFO[0000] TNT721  Token Bank Contract Address: 0x8Be503bcdEd90ED42Eff31f56199399B2b0154CA  prefix=genesis
INFO[0000] TNT1155 Token Bank Contract Address: 0x47c5e40890bcE4a473A49D7501808b9633F29782  prefix=genesis
INFO[0000] Balance Checker    Contract Address: 0x29b2440db4A256B0c1E6d3B4CDcaA68E2440A08f  prefix=genesis
INFO[0000] -------------------------------------------------------------------------------  prefix=genesis
INFO[0000] Sanity checks all passed.                     prefix=genesis

-----------------------------------------------------------------------------------------
Genesis block hash: 0x1e006b532d9a4871976f29c496e713a4d9c089b3a02ad38e40353200867bfadc
-----------------------------------------------------------------------------------------
```

## Next

Please proceed to the next step ["Subchain Registartion and Validator Staking"](./2-register-and-staking.md).
