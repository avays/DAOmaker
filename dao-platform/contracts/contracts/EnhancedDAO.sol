// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./interfaces/IGovernanceToken.sol";
import "./interfaces/ITreasury.sol";

contract EnhancedDAO is Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    
    // Governance Token
    IGovernanceToken public governanceToken;
    ITreasury public treasury;
    
    // Governance Parameters
    uint256 public votingPeriod;
    uint256 public votingDelay;
    uint256 public proposalThreshold;
    uint256 public quorum;
    
    // Enhanced Governance Features
    bool public rankedChoiceEnabled;
    bool public privateVotingEnabled;
    bool public timeWeightedVotingEnabled;
    bool public rageQuitEnabled;
    
    // Rage Quit Parameters
    uint256 public constant RAGE_QUIT_PERIOD = 7 days;
    uint256 public constant RAGE_QUIT_PENALTY = 5; // 5% penalty
    uint256 public rageQuitWindow = 7 days;
    
    // Proposal Types
    enum ProposalType {
        STANDARD,
        RANKED_CHOICE,
        PRIVATE_VOTE
    }
    
    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        uint256 startBlock;
        uint256 endBlock;
        bool executed;
        bool canceled;
        ProposalType proposalType;
        mapping(address => Receipt) receipts;
        bytes[] calldatas;
        address[] targets;
        uint256[] values;
    }
    
    struct Receipt {
        bool hasVoted;
        uint8 support;
        uint256 votes;
        uint256 lockTime; // For time-weighted voting
    }
    
    // Ranked Choice Voting
    struct RankedChoiceProposal {
        uint256 proposalId;
        string[] choices;
        mapping(address => uint256[]) voterRankings;
        mapping(uint256 => uint256) choiceVotes;
        uint256 totalVoters;
    }
    
    // Private Voting (Commit-Reveal)
    struct PrivateVotingProposal {
        uint256 proposalId;
        uint256 commitEndBlock;
        uint256 revealEndBlock;
        mapping(address => bytes32) commitments;
        mapping(address => bool) revealed;
        uint256 revealedForVotes;
        uint256 revealedAgainstVotes;
    }
    
    // Rage Quit
    struct RageQuitRequest {
        address member;
        uint256 tokenAmount;
        uint256 proposalId;
        uint256 requestTime;
        uint256 executeAfter;
        bool executed;
        uint256[] assetAmounts;
    }
    
    // State Variables
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => RankedChoiceProposal) public rankedChoiceProposals;
    mapping(uint256 => PrivateVotingProposal) public privateVotingProposals;
    mapping(address => RageQuitRequest) public rageQuitRequests;
    uint256 public proposalCount;
    
    // Events
    event ProposalCreated(uint256 id, address proposer, ProposalType proposalType);
    event VoteCast(address voter, uint256 proposalId, uint8 support, uint256 votes);
    event ProposalExecuted(uint256 id);
    event RankedVoteSubmitted(address voter, uint256 proposalId, uint256[] rankings);
    event VoteCommitted(address voter, uint256 proposalId, bytes32 commitHash);
    event VoteRevealed(address voter, uint256 proposalId, uint8 support, uint256 votes);
    event RageQuitInitiated(address member, uint256 proposalId, uint256 tokenAmount);
    event RageQuitExecuted(address member, uint256 proposalId, uint256[] amounts);
    
    constructor(
        address _governanceToken,
        address _treasury,
        uint256 _votingPeriod,
        uint256 _votingDelay,
        uint256 _proposalThreshold,
        uint256 _quorum
    ) {
        governanceToken = IGovernanceToken(_governanceToken);
        treasury = ITreasury(_treasury);
        votingPeriod = _votingPeriod;
        votingDelay = _votingDelay;
        proposalThreshold = _proposalThreshold;
        quorum = _quorum;
    }
    
    // Standard Proposal Creation
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public returns (uint256) {
        require(
            governanceToken.balanceOf(msg.sender) >= proposalThreshold,
            "Below proposal threshold"
        );
        
        proposalCount++;
        Proposal storage newProposal = proposals[proposalCount];
        
        newProposal.id = proposalCount;
        newProposal.proposer = msg.sender;
        newProposal.description = description;
        newProposal.targets = targets;
        newProposal.values = values;
        newProposal.calldatas = calldatas;
        newProposal.startBlock = block.number + votingDelay;
        newProposal.endBlock = newProposal.startBlock + votingPeriod;
        newProposal.proposalType = ProposalType.STANDARD;
        
        emit ProposalCreated(proposalCount, msg.sender, ProposalType.STANDARD);
        return proposalCount;
    }
    
    // Standard Voting
    function vote(uint256 proposalId, uint8 support) public {
        Proposal storage proposal = proposals[proposalId];
        require(block.number >= proposal.startBlock, "Voting not started");
        require(block.number <= proposal.endBlock, "Voting ended");
        
        Receipt storage receipt = proposal.receipts[msg.sender];
        require(!receipt.hasVoted, "Already voted");
        
        uint256 votes = governanceToken.balanceOf(msg.sender);
        
        if (support == 0) {
            proposal.againstVotes = proposal.againstVotes.add(votes);
        } else if (support == 1) {
            proposal.forVotes = proposal.forVotes.add(votes);
        } else {
            proposal.abstainVotes = proposal.abstainVotes.add(votes);
        }
        
        receipt.hasVoted = true;
        receipt.support = support;
        receipt.votes = votes;
        
        emit VoteCast(msg.sender, proposalId, support, votes);
    }
    
    // Time-weighted Voting
    function voteWithTimeWeight(
        uint256 proposalId,
        uint8 support,
        uint256 lockDuration
    ) public {
        require(timeWeightedVotingEnabled, "Time-weighted voting not enabled");
        Proposal storage proposal = proposals[proposalId];
        require(block.number >= proposal.startBlock, "Voting not started");
        require(block.number <= proposal.endBlock, "Voting ended");
        require(lockDuration >= 30 days && lockDuration <= 365 days, "Invalid lock duration");
        
        Receipt storage receipt = proposal.receipts[msg.sender];
        require(!receipt.hasVoted, "Already voted");
        
        uint256 baseVotes = governanceToken.balanceOf(msg.sender);
        // Calculate time multiplier (max 3x for 1 year lock)
        uint256 timeMultiplier = 100 + (lockDuration * 200 / 365 days);
        uint256 weightedVotes = baseVotes.mul(timeMultiplier).div(100);
        
        if (support == 0) {
            proposal.againstVotes = proposal.againstVotes.add(weightedVotes);
        } else if (support == 1) {
            proposal.forVotes = proposal.forVotes.add(weightedVotes);
        } else {
            proposal.abstainVotes = proposal.abstainVotes.add(weightedVotes);
        }
        
        receipt.hasVoted = true;
        receipt.support = support;
        receipt.votes = weightedVotes;
        receipt.lockTime = lockDuration;
        
        // Lock tokens
        governanceToken.lock(msg.sender, baseVotes, lockDuration);
        
        emit VoteCast(msg.sender, proposalId, support, weightedVotes);
    }
    
    // Ranked Choice Voting
    function createRankedChoiceProposal(
        string memory description,
        string[] memory choices
    ) public returns (uint256) {
        require(rankedChoiceEnabled, "Ranked choice voting not enabled");
        require(choices.length >= 2, "Need at least 2 choices");
        
        proposalCount++;
        Proposal storage proposal = proposals[proposalCount];
        proposal.id = proposalCount;
        proposal.proposer = msg.sender;
        proposal.description = description;
        proposal.proposalType = ProposalType.RANKED_CHOICE;
        proposal.startBlock = block.number + votingDelay;
        proposal.endBlock = proposal.startBlock + votingPeriod;
        
        RankedChoiceProposal storage rcProposal = rankedChoiceProposals[proposalCount];
        rcProposal.proposalId = proposalCount;
        rcProposal.choices = choices;
        
        emit ProposalCreated(proposalCount, msg.sender, ProposalType.RANKED_CHOICE);
        return proposalCount;
    }
    
    function submitRankedVote(uint256 proposalId, uint256[] memory rankings) public {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.proposalType == ProposalType.RANKED_CHOICE, "Not ranked choice");
        require(block.number >= proposal.startBlock, "Voting not started");
        require(block.number <= proposal.endBlock, "Voting ended");
        
        RankedChoiceProposal storage rcProposal = rankedChoiceProposals[proposalId];
        require(rcProposal.voterRankings[msg.sender].length == 0, "Already voted");
        require(rankings.length == rcProposal.choices.length, "Invalid rankings");
        
        rcProposal.voterRankings[msg.sender] = rankings;
        rcProposal.totalVoters++;
        
        emit RankedVoteSubmitted(msg.sender, proposalId, rankings);
    }
    
    // Private Voting (Commit-Reveal)
    function createPrivateProposal(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description,
        uint256 commitDuration,
        uint256 revealDuration
    ) public returns (uint256) {
        require(privateVotingEnabled, "Private voting not enabled");
        
        proposalCount++;
        Proposal storage proposal = proposals[proposalCount];
        proposal.id = proposalCount;
        proposal.proposer = msg.sender;
        proposal.description = description;
        proposal.proposalType = ProposalType.PRIVATE_VOTE;
        proposal.targets = targets;
        proposal.values = values;
        proposal.calldatas = calldatas;
        proposal.startBlock = block.number + votingDelay;
        
        PrivateVotingProposal storage pvProposal = privateVotingProposals[proposalCount];
        pvProposal.proposalId = proposalCount;
        pvProposal.commitEndBlock = proposal.startBlock + commitDuration;
        pvProposal.revealEndBlock = pvProposal.commitEndBlock + revealDuration;
        proposal.endBlock = pvProposal.revealEndBlock;
        
        emit ProposalCreated(proposalCount, msg.sender, ProposalType.PRIVATE_VOTE);
        return proposalCount;
    }
    
    function commitVote(uint256 proposalId, bytes32 voteHash) public {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.proposalType == ProposalType.PRIVATE_VOTE, "Not private vote");
        
        PrivateVotingProposal storage pvProposal = privateVotingProposals[proposalId];
        require(block.number >= proposal.startBlock, "Voting not started");
        require(block.number <= pvProposal.commitEndBlock, "Commit phase ended");
        require(pvProposal.commitments[msg.sender] == bytes32(0), "Already committed");
        
        pvProposal.commitments[msg.sender] = voteHash;
        
        emit VoteCommitted(msg.sender, proposalId, voteHash);
    }
    
    function revealVote(uint256 proposalId, uint8 support, uint256 nonce) public {
        PrivateVotingProposal storage pvProposal = privateVotingProposals[proposalId];
        require(block.number > pvProposal.commitEndBlock, "Still in commit phase");
        require(block.number <= pvProposal.revealEndBlock, "Reveal phase ended");
        require(!pvProposal.revealed[msg.sender], "Already revealed");
        
        bytes32 voteHash = keccak256(abi.encodePacked(msg.sender, proposalId, support, nonce));
        require(pvProposal.commitments[msg.sender] == voteHash, "Invalid reveal");
        
        uint256 votes = governanceToken.balanceOf(msg.sender);
        
        if (support == 1) {
            pvProposal.revealedForVotes = pvProposal.revealedForVotes.add(votes);
        } else if (support == 0) {
            pvProposal.revealedAgainstVotes = pvProposal.revealedAgainstVotes.add(votes);
        }
        
        pvProposal.revealed[msg.sender] = true;
        
        emit VoteRevealed(msg.sender, proposalId, support, votes);
    }
    
    // Rage Quit Mechanism
    function initiateRageQuit(uint256 proposalId) public nonReentrant {
        require(rageQuitEnabled, "Rage quit not enabled");
        Proposal storage proposal = proposals[proposalId];
        require(proposal.executed || proposal.forVotes > proposal.againstVotes, "Proposal not passed");
        require(block.number > proposal.endBlock, "Voting not ended");
        require(block.number <= proposal.endBlock + rageQuitWindow, "Rage quit period ended");
        
        uint256 memberTokens = governanceToken.balanceOf(msg.sender);
        require(memberTokens > 0, "No tokens to rage quit");
        require(rageQuitRequests[msg.sender].tokenAmount == 0, "Already rage quitting");
        
        // Calculate proportional share of treasury
        uint256 totalSupply = governanceToken.totalSupply();
        uint256[] memory assetAmounts = treasury.calculateProportionalShare(
            memberTokens,
            totalSupply
        );
        
        rageQuitRequests[msg.sender] = RageQuitRequest({
            member: msg.sender,
            tokenAmount: memberTokens,
            proposalId: proposalId,
            requestTime: block.timestamp,
            executeAfter: block.timestamp + 3 days,
            executed: false,
            assetAmounts: assetAmounts
        });
        
        // Burn member's tokens
        governanceToken.burn(msg.sender, memberTokens);
        
        emit RageQuitInitiated(msg.sender, proposalId, memberTokens);
    }
    
    function executeRageQuit() public nonReentrant {
        RageQuitRequest storage request = rageQuitRequests[msg.sender];
        require(request.tokenAmount > 0, "No rage quit request");
        require(!request.executed, "Already executed");
        require(block.timestamp >= request.executeAfter, "Still in timelock");
        
        // Apply penalty
        uint256[] memory finalAmounts = new uint256[](request.assetAmounts.length);
        for (uint256 i = 0; i < request.assetAmounts.length; i++) {
            finalAmounts[i] = request.assetAmounts[i].mul(100 - RAGE_QUIT_PENALTY).div(100);
        }
        
        // Transfer assets from treasury
        treasury.transferAssets(msg.sender, finalAmounts);
        
        request.executed = true;
        
        emit RageQuitExecuted(msg.sender, request.proposalId, finalAmounts);
    }
    
    // Proposal Execution
    function execute(uint256 proposalId) public {
        Proposal storage proposal = proposals[proposalId];
        require(block.number > proposal.endBlock, "Voting not ended");
        require(!proposal.executed, "Already executed");
        require(!proposal.canceled, "Proposal canceled");
        
        // Check voting results based on proposal type
        if (proposal.proposalType == ProposalType.PRIVATE_VOTE) {
            PrivateVotingProposal storage pvProposal = privateVotingProposals[proposalId];
            require(pvProposal.revealedForVotes > pvProposal.revealedAgainstVotes, "Proposal defeated");
            
            uint256 totalVotes = pvProposal.revealedForVotes.add(pvProposal.revealedAgainstVotes);
            require(totalVotes >= governanceToken.totalSupply().mul(quorum).div(100), "Quorum not reached");
        } else {
            uint256 totalVotes = proposal.forVotes.add(proposal.againstVotes);
            require(totalVotes >= governanceToken.totalSupply().mul(quorum).div(100), "Quorum not reached");
            require(proposal.forVotes > proposal.againstVotes, "Proposal defeated");
        }
        
        proposal.executed = true;
        
        // Execute proposal actions
        for (uint256 i = 0; i < proposal.targets.length; i++) {
            (bool success,) = proposal.targets[i].call{value: proposal.values[i]}(
                proposal.calldatas[i]
            );
            require(success, "Transaction execution failed");
        }
        
        emit ProposalExecuted(proposalId);
    }
    
    // Admin Functions
    function setGovernanceParameters(
        uint256 _votingPeriod,
        uint256 _votingDelay,
        uint256 _proposalThreshold,
        uint256 _quorum
    ) public onlyOwner {
        votingPeriod = _votingPeriod;
        votingDelay = _votingDelay;
        proposalThreshold = _proposalThreshold;
        quorum = _quorum;
    }
    
    function enableFeature(string memory feature, bool enabled) public onlyOwner {
        if (keccak256(bytes(feature)) == keccak256(bytes("rankedChoice"))) {
            rankedChoiceEnabled = enabled;
        } else if (keccak256(bytes(feature)) == keccak256(bytes("privateVoting"))) {
            privateVotingEnabled = enabled;
        } else if (keccak256(bytes(feature)) == keccak256(bytes("timeWeighted"))) {
            timeWeightedVotingEnabled = enabled;
        } else if (keccak256(bytes(feature)) == keccak256(bytes("rageQuit"))) {
            rageQuitEnabled = enabled;
        }
    }
}