// Network configurations for browser
export const NETWORKS = {
  sepolia: {
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpcUrl: import.meta.env.VITE_ETHEREUM_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
    explorerUrl: 'https://sepolia.etherscan.io',
    currency: 'ETH'
  },
  goerli: {
    name: 'Goerli Testnet',
    chainId: 5,
    rpcUrl: import.meta.env.VITE_ETHEREUM_RPC_URL || 'https://rpc.goerli.eth.gateway.fm',
    explorerUrl: 'https://goerli.etherscan.io',
    currency: 'ETH'
  },
  mainnet: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: import.meta.env.VITE_ETHEREUM_RPC_URL || 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    currency: 'ETH'
  }
};

// Get current network from environment or default to sepolia
const currentNetworkName = import.meta.env.VITE_NETWORK || 'sepolia';

// Validate and export current network
export const network = NETWORKS[currentNetworkName] || NETWORKS.sepolia;

export const etherscanApiKey = import.meta.env.VITE_ETHERSCAN_API_KEY || '';

// ERC-20 token ABI (minimal interface for balance and transfer)
export const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)'
];

// Helper function to get network by chain ID
export function getNetworkByChainId(chainId) {
  return Object.values(NETWORKS).find(network => network.chainId === chainId);
}

// Helper function to format address (truncate middle)
export function formatAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Helper function to format token amount
export function formatTokenAmount(amount, decimals = 18, maxDecimals = 4) {
  const value = parseFloat(amount);
  if (value === 0) return '0';
  if (value < 0.0001) return '< 0.0001';
  return value.toFixed(Math.min(decimals, maxDecimals)).replace(/\.?0+$/, '');
}
