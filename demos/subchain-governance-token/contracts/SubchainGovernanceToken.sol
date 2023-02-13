// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

//
// To reward the Subchain validator stakers, the SubchainGovernanceToken needs to implement two methods
// to allow the ValidatorStakeManager contract to mint new tokens for the stakers:
//   - function mintStakerReward(address account, uint256 amount) external minterOnly returns (bool)
//   - function stakerRewardPerBlock() external view returns (uint256)
// In addition, the SubchainGovernanceToken needs to set the `minter` to the address of the ValidatorStakeManager
// contract. Please see the implementation below for more details.
//
contract SubchainGovernanceToken is ERC20 {
    using SafeMath for uint256;

    event UpdateStakerRewardPerBlock(uint256 newStakerRewardPerBlock);
    event UpdateAdmin(address newAdmin);
    event UpdateMinter(address newMinter);

    uint8 private _decimals;
    uint256 private _stakerRewardPerBlock;

    uint256 public maxSupply;
    address public minter;
    address public admin;

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 maxSupply_,
        address minter_,
        uint256 stakerRewardPerBlock_,
        address initDistrWallet_,
        uint256 initMintAmount_,
        address admin_
    ) ERC20(name_, symbol_) {
        require(maxSupply_ < 2**96, "maxSupply too large"); // if maxSupply is too large, it may lead to problems in staking reward calculation
        require(
            initMintAmount_ <= maxSupply_,
            "initial supply should not exceed the max supply"
        );
        _decimals = decimals_;
        maxSupply = maxSupply_;
        minter = minter_;
        _stakerRewardPerBlock = stakerRewardPerBlock_;
        admin = admin_;
        _mint(initDistrWallet_, initMintAmount_);
        emit UpdateMinter(minter);
        emit UpdateAdmin(admin);
        emit UpdateStakerRewardPerBlock(_stakerRewardPerBlock);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    // This method allow the minter (e.g. the ValidatorStakeManager contract) to mint new tokens to reward
    // the Subchain validator stakers
    function mintStakerReward(address account, uint256 amount)
        external
        minterOnly
        returns (bool)
    {
        if (msg.sender != minter) {
            return false;
        }
        uint256 currentSupply = this.totalSupply();
        if (currentSupply >= maxSupply) {
            return false;
        }
        if (currentSupply.add(amount) > maxSupply) {
            amount = maxSupply.sub(currentSupply);
        }
        _mint(account, amount);
        return true;
    }

    // This method tells the minter (e.g. the ValidatorStakeManager contract) how many new tokens are minted
    // per Main Chain block for the Subchain validator stakers
    function stakerRewardPerBlock() external view returns (uint256) {
        return _stakerRewardPerBlock;
    }

    function updateStakerRewardPerBlock(uint256 stakerRewardPerBlock_)
        external
        adminOnly
    {
        _stakerRewardPerBlock = stakerRewardPerBlock_;
        emit UpdateStakerRewardPerBlock(_stakerRewardPerBlock);
    }

    function updateMinter(address minter_) external adminOnly {
        minter = minter_;
        emit UpdateMinter(minter);
    }

    function updateAdmin(address admin_) external adminOnly {
        admin = admin_;
        emit UpdateAdmin(admin);
    }

    modifier adminOnly() {
        require(msg.sender == admin, "Only admin can make this call");
        _;
    }

    modifier minterOnly() {
        require(msg.sender == minter, "Only minter can make this call");
        _;
    }
}
