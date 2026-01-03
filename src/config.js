require('dotenv').config();

// Network configurations
const NETWORKS = {
  sepolia: {
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://rpc.sepolia.org',
    explorerUrl: 'https://sepolia.etherscan.io',
    currency: 'ETH'
  },
  goerli: {
    name: 'Goerli Testnet',
    chainId: 5,
    rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://rpc.goerli.eth.gateway.fm',
    explorerUrl: 'https://goerli.etherscan.io',
    currency: 'ETH'
  },
  mainnet: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    currency: 'ETH'
  }
};

// Get current network from environment or default to sepolia
const currentNetwork = process.env.NETWORK || 'sepolia';

// Validate network
if (!NETWORKS[currentNetwork]) {
  console.error(`Invalid network: ${currentNetwork}. Using sepolia as default.`);
  currentNetwork = 'sepolia';
}

// Export configuration
module.exports = {
  network: NETWORKS[currentNetwork],
  etherscanApiKey: process.env.ETHERSCAN_API_KEY || '',
  walletsDir: './wallets',
  // ERC-20 token ABI (minimal interface for balance and transfer)
  ERC20_ABI: [
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'event Transfer(address indexed from, address indexed to, uint256 value)'
  ]
};
