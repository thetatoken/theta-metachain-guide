# Theta Metachain Guide

Theta Labs [announced](https://twitter.com/theta_network/status/1512555910568292355) the Theta Metachain concept in April 2022 and [launched](https://twitter.com/Theta_Network/status/1598467802553323520) it on the Theta Mainnet on Dec 1, 2022.  The Theta Metachain is an interconnected network of blockchains, a “chain of chains”. The goal is to allow permissionless horizontal scaling of the Theta blockchain network in order to achieve potentially unlimited transactional throughput, and 1-2 seconds, or even subsecond block finalization time.

The Theta Metachain([whitepaper here](https://assets.thetatoken.org/theta-mainnet-4-whitepaper.pdf)) consists of one “main chain” and an unlimited number of “subchains”. Just as “meta-” as a prefix refers to something that transcends or is more comprehensive than the subject, ex. metaphysics describing what exists beyond physics, Theta Metachain refers to an overarching “main chain” above many purpose-specific “subchains”. The “main chain” in this case refers to the existing Theta mainnet. Both the "main chain" and the "subchains" are EVM-compatible, and they all use TFuel as the gas token. This provides a unified interface for both the users and developers. The [subchain code](https://github.com/thetatoken/theta-protocol-subchain) also implements a built-in interchain messaging channel which connects the subchain and the main chain, and thus allows crypto assets like TFuel/TNT20/721/1155 tokens to flow freely across the chains.  Since each subchain can execute transactions independently, the Theta Metachain provides a viable path to infinitely scale the processing capacity of the blockchain system. Initially implemented as a multi-chain solution, the Theta Metachain can be extended into a zk-rollup by [adding a few gadgets]((https://assets.thetatoken.org/theta-mainnet-4-whitepaper.pdf)). Such an extension can achieve a higher level of security guarantees. 

This repository provides the technical documentation and SDK necessary for developers to launch and develop on Theta subchains. The process of creating a subchain is permissionless, meaning that anyone can register and launch a subchain. No approval from Theta Labs is required. Please check out the following links to learn more:

* **Overview**: [A high-level overview](./docs/0-overview/README.md) of the subchain launch process.

* **Privatenet Guide**: [A step by step tutorial](./docs/1-privatenet/README.md) on how to setup the Metachain in a local Privatenet environment.

* **Testnet Guide**: [A tutorial](./docs/2-testnet/README.md) on how to setup a subchain and connect it to the Theta Testnet.

* **Mainnet Guide**: [A tutorial](./docs/3-mainnet/README.md) demonstrating the steps for launching a subchain and connecting it to the Theta Mainnet.
