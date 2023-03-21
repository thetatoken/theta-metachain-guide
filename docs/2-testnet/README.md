# Testnet Metachain Guide

In this tutorial, we will guide you through setting up a subchain with one validator, and connect it to the [Theta Testnet Main Chain](https://testnet-explorer.thetatoken.org/). Before trying to launch your subchain for the Testnet, **we highly recommend you to first get yourself familiar with the Metachain Privatenet setup**. The tutorials on how to set up the Metachain Privatenet can be found [here](../1-privatenet/README.md).

We provide two options, namely the **manual flow** and the **wizard flow** for launching a Testnet subchain. The manual flow is similar to the process for configuring a local Metachain Privatenet, where the user needs to setup the environment manually through the command line interface. Alternatively, you may launching a subchain through the "launch wizard" web interface we provide. 

**Important**: Before starting the Testnet Metachain nodes, make sure to stop the Privatenet nodes running on the same machine, otherwise there might be port conflicts.

* **Option 1**. Manual Flow

  * **Step 1**. [Setting up the Testnet Environment](./manual-flow/1-setup.md)

  * **Step 2**. [Subchain Registration and Staking](./manual-flow/2-register-and-staking.md)

  * **Step 3**. [Cross-chain Asset Transfers](./manual-flow/3-cross-chain-asset-transfers.md)

  * **Step 4**. [More on Subchain Validator Staking](./manual-flow/4-more-on-subchain-validator-staking.md)

* **Option 2**. Wizard Flow

  * Please check out [this guide](./wizard-flow/1-wizard-flow.md) for more details.