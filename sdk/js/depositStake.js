require('isomorphic-fetch');
const { BigNumber } = require("@ethersproject/bignumber");
const {setCfg, cfg} = require("./configs")
const thetajs = require("@thetalabs/theta-js");
const {ChainRegistrarOnMainchainContract, SubchainGovernanceTokenContract, DontCare, createProvider, createWallet, expandTo18Decimals, promptForWalletPassword, printValidatorSetForDynasty} = require("./common.js");

async function stakeToSubchainValidator(amountInWei, validatorAddr, wThetaCollateralAmountInWei, tFuelFeeInWei, keyPath, password) {
    if (!password) {
        password = await promptForWalletPassword();
    }
    
    const provider = createProvider(cfg().mainchainIDStr, cfg().mainchainRPC);
    const wallet = createWallet(provider, keyPath, password);

    const wThetaContract = new thetajs.Contract(cfg().wTHETAAddr, SubchainGovernanceTokenContract.abi, wallet) // FIXME: should use wTHETA.abi instead, but SubchainGovernanceTokenContract also has the approve method, so can be used here
    const govTokenContract = new thetajs.Contract(cfg().govTokenContractAddr, SubchainGovernanceTokenContract.abi, wallet)
    const totalGovTokenSupply = await govTokenContract.totalSupply();
    // Staking rewards are an optional feature on governance tokens.
    let stakerRewardPerBlock;
    try { stakerRewardPerBlock = await govTokenContract.stakerRewardPerBlock()} catch (error) {stakerRewardPerBlock = '0'};
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

    if (wThetaCollateralAmountInWei == DontCare) {
        wThetaCollateralAmountInWei = expandTo18Decimals(1000) // 1000 wTHETA
    }
    if (!wThetaCollateralAmountInWei.isZero()) {
        console.log('Approve', wThetaCollateralAmountInWei.toString(), 'wTHETA spendable by VCM', vcmAddr);
        await wThetaContract.approve(vcmAddr, wThetaCollateralAmountInWei);
    
        let depositCollateralTx = await chainRegistrarOnMainchainContract.depositCollateral(cfg().subchainID, validatorAddr, wThetaCollateralAmountInWei);
        console.log("Deposit collateral tx: ", depositCollateralTx.hash);
    }

    console.log('Approve', amountInWei.toString(), 'Gov token spendable by VSM', vsmAddr)
    let approveGovTokenTx = await govTokenContract.approve(vsmAddr, amountInWei);
    console.log("Approving Gov Token tx: ", approveGovTokenTx.hash);

    console.log('Stake', amountInWei.toString(), 'Gov token from the wallet to validator', validatorAddr, '\n')

    if (tFuelFeeInWei == DontCare) {
        tFuelFeeInWei = expandTo18Decimals(cfg().initialFee).mul(2)
    }
    
    console.log('Subchain ID       :', cfg().subchainID)
    console.log('Validator address :', validatorAddr)
    console.log('Stake amount      :', amountInWei.toString(), "GovTokenWei")
    console.log('TFuel fee         :', tFuelFeeInWei.toString(), "TFuelWei")

    let depositStakeTx = await chainRegistrarOnMainchainContract.depositStake(cfg().subchainID, validatorAddr, amountInWei, {value: tFuelFeeInWei.toString()});
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
// When the collateral and minimum fee requirements are satisfied, staking requires neither wTHETA collateral nor TFuel fee
// node depositStake.js privatenet 10000000 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab 0 0 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop

//
// Testnet examples (where the mainchain chainID is 365)
//
// node depositStake.js testnet 10000000000000000000000000 0x2E833968E5bB786Ae419c4d13189fB081Cc43bab ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab
// node depositStake.js testnet 10000000000000000000000000 0x11Ac5dCCEa0603a24E10B6f017C7c3285D46CE8e ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab
// node depositStake.js testnet 15000000000000000000000000 0x2f63946ff190Bd82E053fFF553ef208FbDEB2e67 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab
// node depositStake.js testnet 18000000000000000000000000 0x372D9d124D9B2B5598109009525533578aDF9d45 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab
//
// When the collateral and minimum fee requirements are satisfied, staking requires neither wTHETA collateral nor TFuel fee
// node depositStake.js testnet 10000000 0x372D9d124D9B2B5598109009525533578aDF9d45 0 0 ~/.thetacli/keys/encrypted/2E833968E5bB786Ae419c4d13189fB081Cc43bab qwertyuiop

if (process.argv && !(process.argv.length >= 6 && process.argv.length <= 9)) {
    console.log("Usage:");
    console.log("  node depositStake.js <networkType> <govTokenAmountInWei> <validatorAddr> <stakerKeyPath> [password]");
    console.log("  node depositStake.js <networkType> <govTokenAmountInWei> <validatorAddr> <wThetaCollateralAmountInWei> <tFuelFeeInWei> <stakerKeyPath> [password]");
    console.log("");
    process.exit(1);
}

let networkType = process.argv[2];
setCfg(networkType);

let password = DontCare;
let govTokenAmountInWei = DontCare;
let validatorAddr = DontCare;
let wThetaCollateralAmountInWei = DontCare;
let tFuelFeeInWei = DontCare;
let keyPath = DontCare;

if (process.argv.length == 6 || process.argv.length == 7) {
    govTokenAmountInWei = BigNumber.from(process.argv[3]);
    validatorAddr = process.argv[4];
    keyPath = process.argv[5];
    if (process.argv.length == 7) {
        password = process.argv[6];
    }
} else if (process.argv.length == 8 || process.argv.length == 9) {
    govTokenAmountInWei = BigNumber.from(process.argv[3]);
    validatorAddr = process.argv[4];
    wThetaCollateralAmountInWei = BigNumber.from(process.argv[5]);
    tFuelFeeInWei = BigNumber.from(process.argv[6]);
    keyPath = process.argv[7];
    if (process.argv.length == 9) {
        password = process.argv[8];
    }
}

stakeToSubchainValidator(govTokenAmountInWei, validatorAddr, wThetaCollateralAmountInWei, tFuelFeeInWei, keyPath, password)
