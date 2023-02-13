require('isomorphic-fetch');
const { BigNumber } = require("@ethersproject/bignumber");
const {setCfg, cfg} = require("./configs")
const thetajs = require("@thetalabs/theta-js");
const {ChainRegistrarOnMainchainContract, SubchainGovernanceTokenContract, createProvider, createWallet, expandTo18Decimals, promptForWalletPassword} = require("./common.js")

async function printValidatorSetForDynasty(chainRegistrarOnMainchainContract, dynasty) {
    const {validators, shareAmounts} = await chainRegistrarOnMainchainContract.getValidatorSet(cfg().subchainID, dynasty)
    const numValidators = validators.length;
    for (let i = 0; i < numValidators; i ++) {
        let val = validators[i];
        let shareAmount = shareAmounts[i];
        console.log(`validator: ${val}, shareAmount: ${shareAmount.toString()}`)
    }
    console.log('')
}

async function stakeToSubchainValidator(amountInWei, validatorAddr, keyPath, password) {
    if (!password) {
        password = await promptForWalletPassword();
    }
    
    const provider = createProvider(cfg().mainchainIDStr, cfg().mainchainRPC);
    const wallet = createWallet(provider, keyPath, password);

    const wThetaContract = new thetajs.Contract(cfg().wTHETAAddr, SubchainGovernanceTokenContract.abi, wallet) // FIXME: should use wTHETA.abi instead, but SubchainGovernanceTokenContract also has the approve method, so can be used here
    const govTokenContract = new thetajs.Contract(cfg().govTokenContractAddr, SubchainGovernanceTokenContract.abi, wallet)
    const totalGovTokenSupply = await govTokenContract.totalSupply();
    const stakerRewardPerBlock = await govTokenContract.stakerRewardPerBlock();
    const chainRegistrarOnMainchainContract = new thetajs.Contract(cfg().registrarOnMainchainAddr, ChainRegistrarOnMainchainContract.abi, wallet)
    const vcmAddr = await chainRegistrarOnMainchainContract.vcm();
    const vsmAddr = await chainRegistrarOnMainchainContract.vsm();
    const {dynasty} = await chainRegistrarOnMainchainContract.getDynasty();

    console.log('');
    console.log('SubchainID:', cfg().subchainID);
    console.log('Gov token contract:', cfg().govTokenContractAddr);
    console.log('Gov token supply  :', totalGovTokenSupply.toString());
    console.log('Reward per block  :', stakerRewardPerBlock.toString());
    console.log('Wallet address    :', wallet.address);
    console.log('VCM address       :', vcmAddr);
    console.log('VSM address       :', vsmAddr);
    console.log('Dynasty           :', dynasty.toString());
    console.log('');

    console.log(`Before staking, ValidatorSet for the current dyansty ${dynasty.toString()}:`);
    await printValidatorSetForDynasty(chainRegistrarOnMainchainContract, dynasty);

    console.log(`Before staking, ValidatorSet for the next dyansty ${dynasty.add(1).toString()}:`);
    await printValidatorSetForDynasty(chainRegistrarOnMainchainContract, dynasty.add(1));

    let collateralAmount = expandTo18Decimals(1000) // 1000 wTHETA
    console.log('Approve', collateralAmount.toString(), 'wTHETA spendable by VCM', vcmAddr);
    await wThetaContract.approve(vcmAddr, collateralAmount);

    let depositCollateralTx = await chainRegistrarOnMainchainContract.depositCollateral(cfg().subchainID, validatorAddr, collateralAmount);
    console.log("Deposit collateral tx: ", depositCollateralTx.hash);

    console.log('Approve', amountInWei.toString(), 'Gov token spendable by VSM', vsmAddr)
    let approveGovTokenTx = await govTokenContract.approve(vsmAddr, amountInWei);
    console.log("Approving Gov Token tx: ", approveGovTokenTx.hash);

    console.log('Stake', amountInWei.toString(), 'Gov token from the wallet to validator', validatorAddr, '\n')
    initFeeInWei = expandTo18Decimals(cfg().initialFee)

    console.log('Subchain ID       :', cfg().subchainID)
    console.log('Validator address :', validatorAddr)
    console.log('Stake amount      :', amountInWei.toString(), "GovTokenWei")
    console.log('init fee          :', initFeeInWei.toString(), "TFuelWei")

    let depositStakeTx = await chainRegistrarOnMainchainContract.depositStake(cfg().subchainID, validatorAddr, amountInWei, {value: initFeeInWei.toString()});
    console.log("Attempt to stake", amountInWei.toString(), 'Gov tokens to validator', validatorAddr, '\n');
    console.log("Deposit stake tx: ", depositStakeTx.hash);

    console.log(`After staking, ValidatorSet for the current dyansty ${dynasty.toString()}:`);
    await printValidatorSetForDynasty(chainRegistrarOnMainchainContract, dynasty);

    console.log(`After staking, ValidatorSet for the next dyansty ${dynasty.add(1).toString()}:`);
    await printValidatorSetForDynasty(chainRegistrarOnMainchainContract, dynasty.add(1));
}

//
// MAIN
//

//
// Privatenet examples (where the mainchain chainID is 366)
//
// node depositStake.js privatenet 100000000000000000000000 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop

//
// Testnet examples (where the mainchain chainID is 365)
//
// node depositStake.js testnet 10000000000000000000000000 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab
// node depositStake.js testnet 10000000000000000000000000 0x11Ac5dCCEa0603a24E10B6f017C7c3285D46CE8e ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab
// node depositStake.js testnet 15000000000000000000000000 0x2f63946ff190Bd82E053fFF553ef208FbDEB2e67 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab
// node depositStake.js testnet 18000000000000000000000000 0x372D9d124D9B2B5598109009525533578aDF9d45 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab

if (process.argv && !(process.argv.length == 6 || process.argv.length == 7)) {
    console.log("Usage:");
    console.log("  node depositStake.js <networkType> <amountInWei> <validatorAddr> <stakerKeyPath> [password]");
    console.log("");
    process.exit(1);
}

let networkType = process.argv[2];
setCfg(networkType);

let amountInWei = BigNumber.from(process.argv[3]);
let validatorAddr = process.argv[4];
let keyPath = process.argv[5];

let password = null
if (process.argv.length == 7) {
    password = process.argv[6];
}

stakeToSubchainValidator(amountInWei, validatorAddr, keyPath, password)
