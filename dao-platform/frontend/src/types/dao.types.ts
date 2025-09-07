export interface DAO {
  id: string;
  address: string;
  chain: 'ethereum' | 'solana' | 'polygon';
  name: string;
  symbol: string;
  description: string;
  category: DAOCategory;
  logoUrl?: string;
  website?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Governance settings
  votingPeriod: number;
  votingDelay: number;
  proposalThreshold: bigint;
  quorum: number;
  
  // Token info
  tokenAddress: string;
  tokenSupply: bigint;
  
  // Treasury info
  treasuryAddress: string;
  treasuryValueUSD: number;
  
  // Metadata
  memberCount: number;
  proposalCount: number;
  active: boolean;
}

export enum DAOCategory {
  INVESTMENT = 'investment',
  SOCIAL = 'social',
  PROTOCOL = 'protocol',
  GRANTS = 'grants',
  COLLECTOR = 'collector',
  MEDIA = 'media',
  SERVICE = 'service',
  OTHER = 'other'
}

export interface DAOConfig {
  // Basic info
  name: string;
  symbol: string;
  description: string;
  category: DAOCategory;
  website?: string;
  logo?: File;
  
  // Blockchain
  chain: 'ethereum' | 'solana' | 'polygon';
  network: 'mainnet' | 'testnet';
  
  // Tokenomics
  initialSupply: bigint;
  distribution: {
    founders: number;
    treasury: number;
    publicSale: number;
    reserves: number;
  };
  mintable: boolean;
  burnable: boolean;
  transferRestrictions?: {
    lockupPeriod?: number;
    whitelist?: boolean;
  };
  
  // Governance
  votingPeriod: number;
  votingDelay: number;
  proposalThreshold: number;
  quorum: number;
  votingType: VotingType;
  delegation: boolean;
  earlyExecution: boolean;
  
  // Enhanced Governance Features
  rankedChoiceEnabled: boolean;
  privateVotingEnabled: boolean;
  timeWeightedVotingEnabled: boolean;
  rageQuitEnabled: boolean;
  rageQuitConfig?: RageQuitConfig;
  
  // Treasury
  multisig: {
    required: boolean;
    signers?: string[];
    threshold?: number;
  };
  spendingLimits: {
    daily?: bigint;
    perProposal?: bigint;
  };
  allowedTokens: string[];
  investmentAllocation: number;
  
  // Investment
  investmentEnabled: boolean;
  investmentConfig?: InvestmentConfig;
}

export enum VotingType {
  TOKEN = 'token',
  QUADRATIC = 'quadratic',
  EQUAL = 'equal',
  TIME_WEIGHTED = 'time_weighted',
  CONVICTION = 'conviction'
}

export interface RageQuitConfig {
  rageQuitWindow: number;        // Hours after proposal passes
  minTokensRequired: bigint;     // Minimum tokens to rage quit
  exitPenalty: number;           // Percentage penalty (0-10%)
  cooldownPeriod: number;        // Days before member can rejoin
  protectedAssets: string[];     // Assets that cannot be withdrawn
}

export interface InvestmentConfig {
  strategies: InvestmentStrategy[];
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  assetTypes: AssetType[];
  profitDistribution: {
    frequency: 'monthly' | 'quarterly' | 'manual';
    reinvestmentRatio: number;
  };
  exitStrategy: {
    lockupPeriod: number;
    exitFee: number;
  };
}

export enum InvestmentStrategy {
  BLUE_CHIP = 'blue_chip',
  DEFI_YIELD = 'defi_yield',
  NFT_COLLECTION = 'nft_collection',
  STARTUP_EQUITY = 'startup_equity',
  INDEX_FUND = 'index_fund',
  STABLECOIN_FARMING = 'stablecoin_farming'
}

export enum AssetType {
  CRYPTO = 'crypto',
  NFT = 'nft',
  DEFI = 'defi',
  REAL_ESTATE = 'real_estate',
  EQUITY = 'equity',
  COMMODITY = 'commodity'
}

export interface Member {
  id: string;
  daoId: string;
  walletAddress: string;
  tokenBalance: bigint;
  votingPower: bigint;
  delegatedTo?: string;
  joinedAt: Date;
  lastActive?: Date;
  reputationScore: number;
  proposalsCreated: number;
  votesCast: number;
  badges: Badge[];
  activityLevel: 'inactive' | 'occasional' | 'active' | 'core';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  earnedAt: Date;
}