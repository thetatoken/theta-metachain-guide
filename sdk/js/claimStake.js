require('isomorphic-fetch');
const { BigNumber } = require("@ethersproject/bignumber");
const {setCfg, cfg} = require("./configs")
const thetajs = require("@thetalabs/theta-js");
const {ChainRegistrarOnMainchainContract, ValidatorStakeManager, SubchainGovernanceTokenContract, DontCare, createProvider, createWallet, expandTo18Decimals, promptForWalletPassword, printValidatorSetForDynasty} = require("./common.js")

async function claimStakeBack(keyPath, password) {
    if (!password) {
        password = await promptForWalletPassword();
    }
    
    const provider = createProvider(cfg().mainchainIDStr, cfg().mainchainRPC);
    const wallet = createWallet(provider, keyPath, password);
    const walletAddr = wallet.getAddress();

    const govTokenContract = new thetajs.Contract(cfg().govTokenContractAddr, SubchainGovernanceTokenContract.abi, wallet)
    const chainRegistrarOnMainchainContract = new thetajs.Contract(cfg().registrarOnMainchainAddr, ChainRegistrarOnMainchainContract.abi, wallet)
    const vsmAddr = await chainRegistrarOnMainchainContract.vsm();
    const validatorStakeManager = new thetajs.Contract(vsmAddr, ValidatorStakeManager.abi, wallet);
    const {dynasty} = await chainRegistrarOnMainchainContract.getDynasty();
    const withdrawalQueue = await validatorStakeManager.getWithdrawalQueue(cfg().subchainID)

    console.log('');
    console.log('SubchainID:', cfg().subchainID);
    console.log('Gov token contract:', cfg().govTokenContractAddr);
    console.log('Staker            :', walletAddr);
    console.log('Dynasty           :', dynasty.toString());
    console.log("WithdrawalQueue   :", withdrawalQueue)
    console.log('');

    console.log("Before claiming stake, gov token balance of the staker:", (await govTokenContract.balanceOf(walletAddr)).toString())

    console.log(`Before claiming stake, pending stake withdrawals of staker ${walletAddr}:`)
    if (withdrawalQueue != "0x0000000000000000000000000000000000000000") {
        stakeWithrawalReqs = await chainRegistrarOnMainchainContract.getPendingStakeWithdrawals(cfg().subchainID, walletAddr)
        for (let j = 0; j < stakeWithrawalReqs.length; j ++) {
            console.log(`[Pending withdrawal ${j}] receiver: ${stakeWithrawalReqs[j].receiver}, returned gov token amount: ${stakeWithrawalReqs[j].amount.toString()}, return height: ${stakeWithrawalReqs[j].returnHeight.toString()}`)
            // console.log(stakeWithrawalReqs[j])
        }
        console.log("")
    }

    console.log("claiming the first available stake back...")
    let claimStakeTx = await chainRegistrarOnMainchainContract.claimStake(cfg().subchainID)
    console.log("Claim stake tx: ", claimStakeTx.hash);

    console.log("After claiming stake, gov token balance of the staker:", (await govTokenContract.balanceOf(walletAddr)).toString())

    console.log(`After claiming stake, pending stake withdrawals of staker ${walletAddr}:`)
    stakeWithrawalReqs = await chainRegistrarOnMainchainContract.getPendingStakeWithdrawals(cfg().subchainID, walletAddr)
    if (withdrawalQueue != "0x0000000000000000000000000000000000000000") {
        for (let j = 0; j < stakeWithrawalReqs.length; j ++) {
            console.log(`[Pending withdrawal ${j}] receiver: ${stakeWithrawalReqs[j].receiver}, returned gov token amount: ${stakeWithrawalReqs[j].amount.toString()}, return height: ${stakeWithrawalReqs[j].returnHeight.toString()}`)
            // console.log(stakeWithrawalReqs[j])
        }
        console.log("")
    }
}

//
// MAIN
//

//
// Privatenet examples (where the mainchain chainID is 366)
//
// node claimStake.js privatenet ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop

if (process.argv && !(process.argv.length == 4 || process.argv.length == 5)) {
    console.log("Usage:");
    console.log("  node depositStake.js <networkType> <stakerKeyPath> [password]");
    console.log("");
    process.exit(1);
}

let networkType = process.argv[2];
setCfg(networkType);

let keyPath = process.argv[3];

let password = DontCare
if (process.argv.length == 5) {
    password = process.argv[4];
}

claimStakeBack(keyPath, password)
