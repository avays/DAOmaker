export enum ProposalType {
  STANDARD = 'standard',
  PARAMETER_CHANGE = 'parameter_change',
  FUNDING_REQUEST = 'funding_request',
  INVESTMENT = 'investment',
  DIVESTMENT = 'divestment',
  MEMBER_ACTION = 'member_action',
  EMERGENCY = 'emergency',
  RANKED_CHOICE = 'ranked_choice',
  PRIVATE_VOTE = 'private_vote',
  CUSTOM = 'custom'
}

export enum ProposalStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUCCEEDED = 'succeeded',
  DEFEATED = 'defeated',
  EXECUTED = 'executed',
  CANCELLED = 'cancelled',
  QUEUED = 'queued',
  EXPIRED = 'expired'
}

export interface Proposal {
  id: string;
  proposalId: string;
  daoId: string;
  type: ProposalType;
  title: string;
  description: string;
  proposer: string;
  status: ProposalStatus;
  
  // Voting data
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
  totalVoters: number;
  
  // Timestamps
  createdAt: Date;
  startTime: Date;
  endTime: Date;
  executionTime?: Date;
  
  // Execution
  executed: boolean;
  executionHash?: string;
  actions: ProposalAction[];
  
  // Enhanced features
  votingMethod?: VotingMethod;
  choices?: VotingChoice[];           // For ranked choice
  privateVoting?: PrivateVotingConfig;
  timeWeightedVoting?: boolean;
}

export interface ProposalAction {
  target: string;
  value: bigint;
  data: string;
  description: string;
}

export enum VotingMethod {
  STANDARD = 'standard',
  RANKED_CHOICE = 'ranked_choice',
  COMMIT_REVEAL = 'commit_reveal',
  ZK_PROOF = 'zk_proof',
  RING_SIGNATURE = 'ring_signature'
}

export interface VotingChoice {
  id: string;
  title: string;
  description: string;
  metadata?: any;
}

export interface PrivateVotingConfig {
  method: 'commit_reveal' | 'zk_proof' | 'ring_signature';
  commitEndTime?: Date;
  revealEndTime?: Date;
}

export interface Vote {
  id: string;
  proposalId: string;
  voter: string;
  support: boolean | number;  // Boolean for yes/no, number for ranked choice
  votingPower: bigint;
  reason?: string;
  transactionHash: string;
  timestamp: Date;
  lockDuration?: number;      // For time-weighted voting
}

export interface RankedVote {
  voter: string;
  rankings: string[];         // Ordered array of choice IDs
  votingPower: bigint;
}

export interface CommitRevealVote {
  commitHash: string;
  commitTime: Date;
  revealDeadline: Date;
  revealed: boolean;
}

export interface RageQuitRequest {
  id: string;
  member: string;
  daoId: string;
  tokenAmount: bigint;
  treasuryShare: AssetShare[];
  proposalId: string;
  requestTime: Date;
  executeAfter: Date;
  status: 'pending' | 'executed' | 'cancelled' | 'expired';
}

export interface AssetShare {
  tokenAddress: string;
  symbol: string;
  amount: bigint;
  valueUSD: number;
  isProtected: boolean;
}

export interface ExitShare {
  tokens: bigint;
  proportionalShare: number;
  assets: AssetShare[];
  totalValueUSD: number;
  penalty: number;
  netValueUSD: number;
}

export interface VotingResult {
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes?: bigint;
  totalVoters: number;
  quorumReached: boolean;
  passed: boolean;
  privacyMethod?: 'commit-reveal' | 'zk-proof' | 'ring-signature';
  winningChoice?: string;  // For ranked choice
}

export interface ProposalFilters {
  status?: ProposalStatus;
  type?: ProposalType;
  proposer?: string;
  search?: string;
  sortBy?: 'created' | 'ending' | 'votes';
  order?: 'asc' | 'desc';
}