// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ITreasury {
    function deposit(address token, uint256 amount) external payable;
    function withdraw(address token, uint256 amount, address recipient) external;
    function calculateProportionalShare(uint256 memberTokens, uint256 totalSupply) external view returns (uint256[] memory);
    function transferAssets(address recipient, uint256[] memory amounts) external;
    function getBalance(address token) external view returns (uint256);
    function getTotalValue() external view returns (uint256);
    function executeFunding(address recipient, uint256 amount, address token) external;
    function setDAO(address dao) external;
}