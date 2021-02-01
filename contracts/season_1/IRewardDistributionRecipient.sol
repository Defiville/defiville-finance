// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
// File: contracts/IRewardDistributionRecipient.sol

import './access/Ownable.sol';


abstract contract IRewardDistributionRecipient is Ownable {
    address public rewardDistribution;

    //function notifyRewardAmount(uint256 reward) external vitual;

    modifier onlyRewardDistribution() {
        require(_msgSender() == rewardDistribution, "Caller is not reward distribution");
        _;
    }

    function setRewardDistribution(address _rewardDistribution)
        external
        onlyOwner
    {
        rewardDistribution = _rewardDistribution;
    }
}