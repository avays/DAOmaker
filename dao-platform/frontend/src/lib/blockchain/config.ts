import { createConfig, http } from 'wagmi';
import {
  mainnet,
  polygon,
  sepolia,
  polygonMumbai,
} from 'wagmi/chains';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  coinbaseWallet,
} from '@rainbow-me/rainbowkit/wallets';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        metaMaskWallet,
        rainbowWallet,
        walletConnectWallet,
        coinbaseWallet,
      ],
    },
  ],
  {
    appName: 'DAO Platform',
    projectId,
  }
);

export const wagmiConfig = createConfig({
  connectors,
  chains: [mainnet, polygon, sepolia, polygonMumbai],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [sepolia.id]: http(),
    [polygonMumbai.id]: http(),
  },
});

export const supportedChains = [
  { id: mainnet.id, name: 'Ethereum', testnet: false },
  { id: polygon.id, name: 'Polygon', testnet: false },
  { id: sepolia.id, name: 'Sepolia', testnet: true },
  { id: polygonMumbai.id, name: 'Mumbai', testnet: true },
];