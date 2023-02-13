// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockTNT721 is ERC721 {
    using SafeMath for uint256;

    constructor() ERC721("Mock_TNT721", "Mock_TNT721") {}

    function mint(address account, uint256 tokenID) external {
        _mint(account, tokenID);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://tnt721.metadata.io/";
    }
}
