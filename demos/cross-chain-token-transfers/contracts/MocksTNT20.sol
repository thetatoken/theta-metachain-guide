// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockTNT20 is ERC20 {
    using SafeMath for uint256;

    constructor() ERC20("Mock_TNT20", "Mock_TNT20") {}

    function mint(address account, uint256 amount) external {
        _mint(account, amount);
    }
}