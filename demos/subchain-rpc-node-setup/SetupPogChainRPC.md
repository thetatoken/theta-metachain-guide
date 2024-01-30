# Setup Subchain RPC Node (POG Chain):

## Introduction
This guide provides detailed instructions on setting up a Subchain RPC Node, specifically for the POG chain on the Theta network. A Subchain RPC Node enables interaction with the Subchain blockchain, allowing for advanced functionalities such as executing smart contracts, processing transactions, and accessing blockchain data. This setup is crucial for developers and network participants who wish to engage deeply with the Theta ecosystem.

## General Info

### Recommended Specs:
- 8 core
- 32GB RAM
- 512GB SSD

## Steps:
To set up the nodes, please follow steps 1.1, 1.2, 1.3, and 1.4 [here](https://github.com/thetatoken/theta-metachain-guide/blob/master/docs/3-mainnet/manual-flow/1-setup.md) and step 1 [here](https://github.com/thetatoken/theta-metachain-guide/blob/master/docs/3-mainnet/manual-flow/2-register-and-staking.md) to run a main chain node, an ETH RPC adapter for the main chain node, an ETH RPC adapter for the subchain node, and the subchain node itself. You will need to change the p2p.seeds in the config.yaml file ([this one](https://github.com/thetatoken/theta-metachain-guide/blob/master/sdk/configs/mainnet/subchain/validator/config.yaml)) for the subchain node so it can connect to the POG subchain bridge nodes we run. Additionally, you need the public IP addresses of the bridges, their p2p ports, and an export of the POG subchain snapshot.

# Walkthrough

We will look at the POG chain Subchain.

## 1. Setup Theta Node:
Ensure the following software is installed on your machine:
- [Golang](https://go.dev/dl/) 1.14 or a higher version. Also, make sure Golang-related environment variables like `$GOPATH` are set properly.
- The [Truffle suite](https://trufflesuite.com/docs/truffle/getting-started/installation/) for smart contract compilation and deployment.

### 1.1 Compile the Theta Binaries
Compile the Theta binaries from the source code:

```bash
# Ensure your $GOPATH environment variable is set properly before running the following commands
mkdir -p $GOPATH/src/github.com/thetatoken

git clone https://github.com/thetatoken/theta-protocol-ledger.git $GOPATH/src/github.com/thetatoken/theta
export THETA_HOME=$GOPATH/src/github.com/thetatoken/theta
cd $THETA_HOME
git checkout release
git pull origin release
export GO111MODULE=on
make install
```

### 1.2 Compile the ETH RPC Adapter Binary
Compile the ETH RPC Adapter binary from the source code:

```bash
cd $GOPATH/src/github.com/thetatoken
git clone https://github.com/thetatoken/theta-eth-rpc-adaptor
export THETA_ETH_RPC_ADAPTOR_HOME=$GOPATH/src/github.com/thetatoken/theta-eth-rpc-adaptor
cd $THETA_ETH_RPC_ADAPTOR_HOME
git checkout main
git pull origin main
export GO111MODULE=on
make install
```

### 1.3 Compile the Subchain Binaries
Compile the subchain binaries from the source code:

```bash
# switch THETA to the sc-privatenet branch before compiling thetasubchain
cd $THETA_HOME
git checkout sc-privatenet
git pull origin sc-privatenet

git clone https://github.com/thetatoken/theta-protocol-subchain.git $GOPATH/src/github.com/thetatoken/thetasubchain
export SUBCHAIN_HOME=$GOPATH/src/github.com/thetatoken/thetasubchain
cd $SUBCHAIN_HOME
git checkout master
git pull origin master
export GO111MODULE=on
make install
```

### 1.4 Set Up the Workspace for the Mainnet Environment
Run the following commands to set up the workspace:

```bash
cd ~
mkdir -p metachain_playground
mkdir -p metachain_playground/mainnet
mkdir -p metachain_playground/mainnet/workspace

# skip the following command if you have cloned this repo earlier
cd ~/metachain_playground/
git clone https://github.com/thetatoken/theta-metachain-guide
cd theta-metachain-guide
export METACHAIN_GUIDE_ROOT=`pwd`cd sdk/js
npm install

mkdir -p ~/.thetacli/keys/encrypted/
cp keys/encrypted/* ~/.thetacli/keys/encrypted/
```

Next, copy over the configs for both the Main Chain and the Subchain:

```bash
cd $METACHAIN_GUIDE_ROOT
rm -rf ~/metachain_playground/mainnet/mainchain
rm -rf ~/metachain_playground/mainnet/subchain
cp -r sdk/configs/mainnet/* ~/metachain_playground/mainnet/
```

Then, download the latest snapshot of the Mainnet Main Chain:

```bash
cd ~/metachain_playground/mainnet/mainchain/walletnode
wget -O ./snapshot `curl -k https://mainnet-data.thetatoken.org/snapshot`
curl -k --output ./config.yaml `curl -k 'https://mainnet-data.thetatoken.org/config?is_guardian=true'`
```

## 2. Setup config.yaml file for Subchain

Go to config.yaml file:

```bash
cd ~/metachain_playground/mainnet/subchain/validator
nano config.yaml
```

Update the config.yaml file, in this case (POG subchain), set it to following:

```bash
# Theta Subchain configuration
genesis:
  hash: "0xd84676c418ed9aa9f2a6fb46f61d28fe72995da7097ab554010b2ef9a633a996"
p2p:
  # Please make sure to configure firewall settings of the validators so the 12100 port of a node is open to all other validators.
  port: 12100

  # It is recommended to include the ip_address:p2p_port of ALL the other validators in the seeds list, separated by commas.
  seeds: 3.21.133.207:12010,3.139.219.6:12010
rpc:
  enabled: true
log:
  levels: "*:info"
  #levels: "*:debug"
consensus:
  minBlockInterval: 3
subchain:
  mainchainEthRpcURL: "http://localhost:18888/rpc"
  subchainEthRpcURL: "http://localhost:19888/rpc"
  chainRegistrarOnMainchain: "0xb164c26fd7970746639151a8C118cce282F272A7"
  mainchainTFuelTB: "0xf83239088B8766a27cD1f46772a2E1f88e916322"
  mainchainTNT20TB: "0xB3d93735de018Ad48122bf7394734A7d18007e1b"
  mainchainTNT721TB: "0xFe2d1bE6bD9d342cfa59e75290F9b0B42cdBCDAF"
  mainchainTNT1155TB: "0xA31168d669112937B0826b1Bf15f0eb12e6B1542"
  updateInterval: 3000
  # use the numerical EVM chainID for <YOUR_EVM_chainID> below, e.g. 360998877 
  chainID: 9065
```

## 3. Add Subchain Snapshot

Next we need to upload a subchain snapshot. To get a up to date subchain snapshot ask the ThetaLabs team.
This is a POG chain snapshot from January 23rd 2024

[snapshot](https://prod-files-secure.s3.us-west-2.amazonaws.com/cfd2e250-eaa5-4407-82e3-131cbd829021/0a0669fd-dc18-4b44-af16-ddcaffa34d19/snapshot.txt)

We upload this snapshot to our node into following directory:

```bash
 ~/metachain_playground/mainnet/subchain/validator/
```

## 4. Start the Main Chain node and its ETH RPC Adapter

Execute the following commands to start the Main Chain node:

```bash
mkdir -p ~/metachain_playground/mainnet/workspace
cd ~/metachain_playground/mainnet/workspace
theta start --config=../mainchain/walletnode --password=<YOUR_MAIN_CHAIN_NODE_PASSWORD>
```

Wait until the Main Chain walletnode gets insync with the network. This may take some time (e.g. 1-2 hours). You can run the following command to check its synchronization status. If in the output says `"syncing": false` it means the node is synced to the latest block.

```bash
thetacli query status

## Returns something like this:
{
    "address": "0x47A1c10f108C2E8D3985B933a2F2da5d0495be6f",
    "chain_id": "mainnet",
    "current_epoch": "23956299",
    "current_height": "23809320",
    "current_time": "1706043592",
    "genesis_block_hash": "0xd8836c6cf3c3ccea0b015b4ed0f9efb0ffe6254db793a515843c9d0f68cbab65",
    "latest_finalized_block_epoch": "23956297",
    "latest_finalized_block_hash": "0x0582b4a5af7690471e5e5a64f564e86317f77613615f4254b75de6d8172a067f",
    "latest_finalized_block_height": "23809320",
    "latest_finalized_block_time": "1706043580",
    "peer_id": "0x47A1c10f108C2E8D3985B933a2F2da5d0495be6f",
    "snapshot_block_hash": "0xba87b515744ae26b013c03c7d6f00e74a6f81257c26d368be456cd9d3bd4461d",
    "snapshot_block_height": "23763989",
    "syncing": false
}
```

**After** the Main Chain walletnode is in-sync with the network, run the following command in *another terminal*:

```bash
cd ~/metachain_playground/mainnet/workspace
theta-eth-rpc-adaptor start --config=../mainchain/ethrpc
```

## 4. Run the Subchain validator and the ETH RPC Adapter

We need start the subchain ETH RPC adapter **before** starting the subchain validator. This order is important.

```bash
cd ~/metachain_playground/mainnet/workspace
theta-eth-rpc-adaptor start --config=../subchain/ethrpc
```

Then, run the following command to start the node:

```bash
cd ~/metachain_playground/mainnet/workspace
thetasubchain start --config=../subchain/validator --password=<VALIDATOR_PASSWORD>

```

## Done / Troubleshooting

You should have two nodes and two eth rpc adapters up running!

Here are a few commands to test if everything is working:

Check if Theta Node is synced:

```bash
thetacli query status
```

Check if Theta bridge RPC is working:

```bash
curl -X POST -H 'Content-Type: application/json' --data '{"jsonrpc":"2.0","method":"theta.GetAccount","params":[{"address":"0xD52bBEBce2052f77c0FdA982Ea7071F9326Cc005"}],"id":1}' http://localhost:16888/rpc
```

Check if Subchain bridge RPC is working:

```bash
curl -X POST -H 'Content-Type: application/json' --data '{"jsonrpc":"2.0","method":"theta.GetAccount","params":[{"address":"0xD52bBEBce2052f77c0FdA982Ea7071F9326Cc005"}],"id":1}' http://localhost:16900/rpc
```

Check if Theta ETH RPC is working:

```bash
curl -X POST -H 'Content-Type: application/json' --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0xD52bBEBce2052f77c0FdA982Ea7071F9326Cc005", "latest"],"id":1}' http://localhost:18888/rpc
```

Check if Subchain ETH RPC is working:

```bash
curl -X POST -H 'Content-Type: application/json' --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0xD52bBEBce2052f77c0FdA982Ea7071F9326Cc005", "latest"],"id":1}' http://localhost:19888/rpc
```

### Troubleshooting:

If there are problems, the most likely ones are:

1. You did not follow the instructions or there was a problem when installing go or other libaries
2. The config.yaml file is not correctly configured
3. Something with the ports got messed up (e.g. in the config.yaml file)
4. Your ports that the nodes use to connect to peers are not open

# Troubleshooting:
If you encounter problems, they are most likely due to:

1. Not following the instructions correctly or encountering issues during the installation of Go or other libraries.
2. Incorrect configuration of the config.yaml file.
3. Issues related to ports, such as incorrect settings in the config.yaml file.
4. The ports used by the nodes to connect to peers are not open.
5. Failure to switch to the correct Git branch during "1.3 Compile the Subchain Binaries". It's essential to ensure that you are on the appropriate branch before compiling.
