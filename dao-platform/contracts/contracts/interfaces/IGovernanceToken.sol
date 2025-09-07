// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IGovernanceToken {
    function balanceOf(address account) external view returns (uint256);
    function totalSupply() external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
    function lock(address account, uint256 amount, uint256 duration) external;
    function unlock(address account) external;
    function delegate(address delegatee) external;
    function delegates(address account) external view returns (address);
    function getPastVotes(address account, uint256 blockNumber) external view returns (uint256);
}