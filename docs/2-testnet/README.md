# Testnet Metachain Guide

## Subchain Setup

In this tutorial, we will guide you through setting up a subchain for the Testnet and connect it to the [Theta Testnet Main Chain](https://testnet-explorer.thetatoken.org/). Before trying to launch your subchain for the Testnet, **we highly recommend you to first get yourself familiar with the Metachain Privatenet setup**. The tutorials on how to set up the Metachain Privatenet can be found [here](../1-privatenet/README.md).

We provide two options, namely the **manual flow** and the **wizard flow** for launching a Testnet subchain. The manual flow is similar to the process for configuring a local Metachain Privatenet, where the user needs to setup the environment manually through the command line interface. Alternatively, you may launching a subchain through the "launch wizard" web interface we provide. 

**Important**: Before starting the Testnet Metachain nodes, make sure to stop the Privatenet nodes running on the same machine, otherwise there might be port conflicts.

* **Option 1**. Manual Flow

  * **Step 1**. [Setting up the Testnet Environment](./manual-flow/1-setup.md)

  * **Step 2**. [Subchain Registration and Staking](./manual-flow/2-register-and-staking.md)

  * **Step 3**. [Cross-chain Asset Transfers](./manual-flow/3-cross-chain-asset-transfers.md)

  * **Step 4**. [More on Subchain Validator Staking](./manual-flow/4-more-on-subchain-validator-staking.md)

* **Option 2**. Wizard Flow

  * Please check out [this guide](./wizard-flow/1-wizard-flow.md) for more details.

## Add Your Subchain to the Official Testnet Explorer

Please contact us at support@thetalabs.org if you want to add your Subchain to the official [Metachain Testnet explorer](https://testnet-metachain-explorer.thetatoken.org/). When contacting us, kindly provide an endpoint for the Theta subchain native RPC API to facilitate the verification of its operation. This will enable us to ensure that the subchain is running correctly. 

To enable the native RPC API, please set `rpc.enabled: true` in the `<CONFIG_FOLDER>/config.yaml` file of a subchain node and then restart the node. Here `<CONFIG_FOLDER>` is the config folder you specified when you started the subchain node with `thetasubchain start --config=<CONFIG_FOLDER>`. By default, the RPC API server is running at port 16900. You can change the port through the `rpc.port` config. To verify your native RPC endpoint is working properly, please execute the following `curl` command against your endpoint and check if it returns the correct status of your subchain: 

```shell
curl -X POST -H 'Content-Type: application/json' --data '{"jsonrpc":"2.0","method":"theta.GetStatus","params":[],"id":1}' <YOUR_API_ENDPOINT>

# An example showing the status query for the "Playground" subchain:
curl -X POST -H 'Content-Type: application/json' --data '{"jsonrpc":"2.0","method":"theta.GetStatus","params":[],"id":1}' https://tsub360888-rpc.thetatoken.org/rpc
```
