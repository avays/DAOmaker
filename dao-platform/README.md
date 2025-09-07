# DAO Platform - Enhanced Governance & Investment Pools

A comprehensive multi-chain DAO platform with advanced governance features including ranked choice voting, private voting, time-weighted voting, and rage quit mechanisms.

## 🚀 Features

### Enhanced Governance
- **Ranked Choice Voting**: Multiple-choice proposals with instant runoff voting
- **Private Voting**: Commit-reveal and zero-knowledge proof voting options
- **Time-weighted Voting**: Increased voting power for long-term token holders
- **Rage Quit Mechanism**: Members can exit with proportional treasury share

### Core Features
- Multi-chain support (Ethereum, Polygon, Solana)
- Visual DAO creation wizard (no coding required)
- Investment pool management
- Treasury management with multi-sig support
- Real-time updates via WebSocket
- Member reputation system

## 📁 Project Structure

```
dao-platform/
├── frontend/          # React + Vite + Tailwind UI
├── backend/           # Express + Prisma + PostgreSQL API
├── contracts/         # Solidity smart contracts
└── shared/           # Shared types and utilities
```

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast builds
- Tailwind CSS + ShadCN UI components
- Wagmi + RainbowKit for Web3
- Zustand for state management
- React Router for navigation

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM with PostgreSQL
- Socket.io for real-time updates
- JWT authentication
- Rate limiting & security middleware

### Smart Contracts
- Solidity 0.8.20
- OpenZeppelin contracts
- Hardhat development framework
- Enhanced governance mechanisms

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dao-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create `.env` files in both frontend and backend directories:

**Backend `.env`:**
```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/dao_platform
JWT_SECRET=your-secret-key
ETHEREUM_RPC_URL=your-rpc-url
POLYGON_RPC_URL=your-rpc-url
```

**Frontend `.env`:**
```env
VITE_WALLETCONNECT_PROJECT_ID=your-project-id
VITE_API_URL=http://localhost:4000
```

4. Set up the database:
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

5. Deploy smart contracts (optional for local testing):
```bash
cd contracts
npx hardhat compile
npx hardhat deploy --network localhost
```

### Running the Application

1. Start the backend:
```bash
cd backend
npm run dev
```

2. Start the frontend:
```bash
cd frontend
npm run dev
```

3. Access the application at `http://localhost:3000`

## 📋 API Endpoints

### DAO Management
- `GET /api/daos` - List all DAOs
- `POST /api/daos` - Create new DAO
- `GET /api/daos/:address` - Get DAO details
- `PUT /api/daos/:address` - Update DAO settings

### Governance
- `GET /api/governance/proposals` - List proposals
- `POST /api/governance/proposals` - Create proposal
- `POST /api/governance/proposals/:id/vote` - Submit vote
- `POST /api/governance/proposals/:id/vote/ranked` - Submit ranked choice vote
- `POST /api/governance/proposals/:id/vote/commit` - Commit private vote
- `POST /api/governance/proposals/:id/vote/reveal` - Reveal private vote
- `POST /api/governance/rage-quit/initiate` - Initiate rage quit
- `POST /api/governance/rage-quit/:id/execute` - Execute rage quit

### Treasury
- `GET /api/treasury/:dao` - Get treasury details
- `POST /api/treasury/deposit` - Deposit funds
- `POST /api/treasury/withdraw` - Withdraw funds

## 🔧 Smart Contract Architecture

### Main Contracts
- `EnhancedDAO.sol` - Core DAO with enhanced governance features
- `GovernanceToken.sol` - ERC20 governance token with locking
- `Treasury.sol` - Multi-asset treasury management
- `InvestmentPool.sol` - Collective investment management

### Key Functions
- `propose()` - Create standard proposal
- `voteWithTimeWeight()` - Vote with time-weighted power
- `createRankedChoiceProposal()` - Create multi-choice proposal
- `commitVote()` / `revealVote()` - Private voting
- `initiateRageQuit()` - Start rage quit process
- `executeRageQuit()` - Complete rage quit after timelock

## 🔐 Security Features

- Reentrancy protection
- Integer overflow protection (SafeMath)
- Access control (Ownable)
- Time manipulation protection
- Flash loan attack prevention
- Input validation and sanitization
- Rate limiting
- CORS configuration

## 🚀 Deployment

### Frontend
```bash
cd frontend
npm run build
# Deploy dist/ folder to CDN or static hosting
```

### Backend
```bash
cd backend
npm run build
npm start
```

### Smart Contracts
```bash
cd contracts
npx hardhat run scripts/deploy.js --network mainnet
```

## 📊 Database Schema

The platform uses PostgreSQL with the following main tables:
- `daos` - DAO configurations and metadata
- `members` - DAO membership and voting power
- `proposals` - All proposal types and voting data
- `votes` - Standard voting records
- `ranked_votes` - Ranked choice voting data
- `private_votes` - Commit-reveal voting data
- `rage_quit_requests` - Rage quit tracking
- `treasury_transactions` - Treasury activity
- `investments` - Investment pool positions

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test

# Smart contract tests
cd contracts
npx hardhat test
```

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

## 📞 Support

For questions and support, please open an issue on GitHub.

---

Built with ❤️ for the decentralized future