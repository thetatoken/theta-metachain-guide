// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MockTNT1155 is ERC1155 {
    using SafeMath for uint256;

    constructor() ERC1155("") {}

    function uri(uint256 tokenID) public pure override returns (string memory) {
        string memory tokenURI = string(
            abi.encodePacked(
                "https://tnt1155.metadata.io/",
                Strings.toString(tokenID)
            )
        );
        return tokenURI;
    }

    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external {
        _mint(to, id, amount, data);
    }
}
