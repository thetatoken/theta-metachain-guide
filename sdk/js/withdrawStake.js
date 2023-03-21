require('isomorphic-fetch');
const { BigNumber } = require("@ethersproject/bignumber");
const {setCfg, cfg} = require("./configs")
const thetajs = require("@thetalabs/theta-js");
const {ChainRegistrarOnMainchainContract, ValidatorStakeManager, SubchainGovernanceTokenContract, DontCare, createProvider, createWallet, expandTo18Decimals, promptForWalletPassword, printValidatorSetForDynasty} = require("./common.js")

async function withdrawStakeFromSubchainValidator(shareAmountInWei, validatorAddr, keyPath, password) {
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

    console.log(`Before stake withdrawal, ValidatorSet for the current dyansty ${dynasty.toString()}:`);
    await printValidatorSetForDynasty(chainRegistrarOnMainchainContract, dynasty);

    console.log(`Before stake withdrawal, ValidatorSet for the next dyansty ${dynasty.add(1).toString()}:`);
    await printValidatorSetForDynasty(chainRegistrarOnMainchainContract, dynasty.add(1));

    let shares = await validatorStakeManager.getStakerShares(cfg().subchainID, validatorAddr, walletAddr);
    console.log(`Before stake withdrawal, staker ${walletAddr} has ${shares.toString()} shares on validator ${validatorAddr}\n`);

    console.log(`Before stake withdrawal, pending stake withdrawals of staker ${walletAddr}:`)
    if (withdrawalQueue != "0x0000000000000000000000000000000000000000") {
        stakeWithrawalReqs = await chainRegistrarOnMainchainContract.getPendingStakeWithdrawals(cfg().subchainID, walletAddr)
        for (let j = 0; j < stakeWithrawalReqs.length; j ++) {
            console.log(`[Pending withdrawal ${j}] receiver: ${stakeWithrawalReqs[j].receiver}, returned gov token amount: ${stakeWithrawalReqs[j].amount.toString()}, return height: ${stakeWithrawalReqs[j].returnHeight.toString()}`)
            // console.log(stakeWithrawalReqs[j])
        }
        console.log("")
    }

    console.log('Withdraw', shareAmountInWei.toString(), 'shares from the wallet to validator', validatorAddr, '\n')
    // let subchainTotalShares = await validatorStakeManager.totalShareOf(cfg().subchainID)
    // let totalStakedGovTokens = await govTokenContract.balanceOf(vsmAddr)
    // let estimatedGovTokensWithdrawn = totalStakedGovTokens.mul(shareAmountInWei).div(subchainTotalShares).toString()
    let stakerTotalShares = await validatorStakeManager.shareOf(cfg().subchainID, walletAddr)
    let estimatedTotalStakedGovTokens = await validatorStakeManager.estimatedGovernanceTokenOwnedBy(cfg().subchainID, walletAddr)
    let estimatedGovTokensWithdrawn = estimatedTotalStakedGovTokens.mul(shareAmountInWei).div(stakerTotalShares).toString()

    console.log('Subchain ID       :', cfg().subchainID)
    console.log('Validator address :', validatorAddr)
    console.log('share amount      :', shareAmountInWei.toString(), "SharesInWei")
    console.log('estimated governance token withdrawn:', estimatedGovTokensWithdrawn.toString(), "GovTokensInWei")

    let withdrawalTx = await chainRegistrarOnMainchainContract.withdrawStake(cfg().subchainID, validatorAddr, shareAmountInWei)

    console.log("Attempt to withdraw", shareAmountInWei.toString(), 'shares from validator', validatorAddr, '\n');
    console.log("Withdraw stake tx: ", withdrawalTx.hash);

    console.log(`After stake withdrawal, ValidatorSet for the current dyansty ${dynasty.toString()}:`);
    await printValidatorSetForDynasty(chainRegistrarOnMainchainContract, dynasty);

    console.log(`After stake withdrawal, ValidatorSet for the next dyansty ${dynasty.add(1).toString()}:`);
    await printValidatorSetForDynasty(chainRegistrarOnMainchainContract, dynasty.add(1));

    shares = await validatorStakeManager.getStakerShares(cfg().subchainID, validatorAddr, walletAddr);
    console.log(`After stake withdrawal, staker ${walletAddr} has ${shares.toString()} shares on validator ${validatorAddr}\n`);

    console.log(`After stake withdrawal, pending stake withdrawals of staker ${walletAddr}:`)
    stakeWithrawalReqs = await chainRegistrarOnMainchainContract.getPendingStakeWithdrawals(cfg().subchainID, walletAddr)
    for (let j = 0; j < stakeWithrawalReqs.length; j ++) {
        console.log(`[Pending withdrawal ${j}] receiver: ${stakeWithrawalReqs[j].receiver}, returned gov token amount: ${stakeWithrawalReqs[j].amount.toString()}, return height: ${stakeWithrawalReqs[j].returnHeight.toString()}`)
        // console.log(stakeWithrawalReqs[j])
    }
    console.log("")
}

//
// MAIN
//

//
// Privatenet examples (where the mainchain chainID is 366)
//
// node withdrawStake.js privatenet 1000 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop

//
// Testnet examples (where the mainchain chainID is 365)
//
// node withdrawStake.js testnet 1000 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop

if (process.argv && !(process.argv.length == 6 || process.argv.length == 7)) {
    console.log("Usage:");
    console.log("  node depositStake.js <networkType> <shareAmountInWei> <validatorAddr> <stakerKeyPath> [password]");
    console.log("");
    process.exit(1);
}

let networkType = process.argv[2];
setCfg(networkType);

let shareAmountInWei = BigNumber.from(process.argv[3]);
let validatorAddr = process.argv[4];
let keyPath = process.argv[5];

let password = DontCare
if (process.argv.length == 7) {
    password = process.argv[6];
}

withdrawStakeFromSubchainValidator(shareAmountInWei, validatorAddr, keyPath, password)
