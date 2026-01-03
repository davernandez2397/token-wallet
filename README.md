# Ethereum Token Wallet

A beginner-friendly wallet for interacting with Ethereum and ERC-20 tokens. Includes both a CLI tool and a modern web interface. Perfect for learning blockchain development!

## Features

- 🔐 **Wallet Management**: Create new wallets or import existing ones
- 💰 **Balance Checking**: View ETH and ERC-20 token balances
- 📤 **Send Transactions**: Transfer ETH and tokens to other addresses
- 📜 **Transaction History**: View past transactions (requires Etherscan API key)
- 🔒 **Secure Storage**: Wallets are encrypted with a password
- 🧪 **Testnet First**: Configured for Sepolia testnet by default

## Prerequisites

- Node.js (v18 or higher)
- An RPC provider account (free options: [Infura](https://infura.io) or [Alchemy](https://alchemy.com))
- Optional: Etherscan API key for transaction history ([Get one here](https://etherscan.io/apis))

## Installation

1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd token-wallet
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

5. Edit `.env` file with your configuration:
   ```env
   ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY
   NETWORK=sepolia
   ```

## Usage

### Display Help

```bash
npm start
# or
node src/index.js
```

### Wallet Commands

#### Create a New Wallet
```bash
npm start wallet create
```
This will:
- Generate a new random wallet with a mnemonic phrase
- Display the address and mnemonic
- Optionally save the wallet (encrypted with a password)

**⚠️ IMPORTANT**: Save your mnemonic phrase in a secure location! You'll need it to recover your wallet.

#### Import an Existing Wallet
```bash
npm start wallet import
```
You can import from:
- Private key (starts with `0x`)
- Mnemonic phrase (12 or 24 words)

#### List Saved Wallets
```bash
npm start wallet list
```

### Check Balances

#### Check ETH Balance
```bash
npm start balance <ADDRESS>
```

Example:
```bash
npm start balance 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

#### Check ERC-20 Token Balance
```bash
npm start balance <ADDRESS> --token <TOKEN_CONTRACT_ADDRESS>
```

Example (USDC on Sepolia):
```bash
npm start balance 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb --token 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
```

### Send Transactions

#### Send ETH
```bash
npm start send <RECIPIENT_ADDRESS> <AMOUNT>
```

Example:
```bash
npm start send 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb 0.01
```

#### Send ERC-20 Tokens
```bash
npm start send <RECIPIENT_ADDRESS> <AMOUNT> --token <TOKEN_CONTRACT_ADDRESS>
```

Example:
```bash
npm start send 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb 10 --token 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
```

The CLI will:
1. Ask you to select a wallet
2. Prompt for your wallet password
3. Show transaction details and gas estimates
4. Ask for confirmation before sending

### View Transaction History

```bash
npm start history <ADDRESS>
```

Options:
- `--limit <number>`: Number of transactions to display (default: 10)
- `--token <address>`: Filter by specific ERC-20 token

Example:
```bash
npm start history 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb --limit 20
```

### Network Information

```bash
npm start info
```

Displays current network configuration and settings.

## Web Interface

The project includes a modern React-based web interface for a more user-friendly experience!

### Features

- 🌐 **MetaMask Integration**: Connect your MetaMask wallet directly
- 💰 **Live Balance Display**: View ETH and ERC-20 token balances in real-time
- 📤 **Send Transactions**: Transfer ETH and tokens with gas estimation
- 📜 **Transaction History**: View your complete transaction history
- 🎨 **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- ⚡ **Fast & Reactive**: Real-time updates using React Query

### Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Edit `frontend/.env` with your configuration:
   ```env
   VITE_ETHEREUM_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
   VITE_ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY
   VITE_NETWORK=sepolia
   ```

### Running the Web Interface

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Using the Web Interface

1. **Connect Wallet**: Click "Connect Wallet" and approve the MetaMask connection
2. **View Balances**: Your ETH balance and token balances will load automatically
3. **Add Tokens**: Click "Add Token" to track custom ERC-20 tokens
4. **Send Transactions**:
   - Choose between ETH or Token transfer
   - Enter recipient address and amount
   - Preview gas estimates
   - Confirm and send via MetaMask
5. **View History**: Scroll down to see your transaction history (requires Etherscan API key)

### MetaMask Setup

1. Install [MetaMask browser extension](https://metamask.io/download/)
2. Create or import a wallet
3. Switch to Sepolia testnet:
   - Click the network dropdown
   - Select "Show test networks" in settings
   - Choose "Sepolia testnet"
4. Get testnet ETH from faucets (see below)

### Building for Production

```bash
cd frontend
npm run build
```

The production build will be in `frontend/dist/` and can be deployed to any static hosting service (Vercel, Netlify, Cloudflare Pages, etc.)

## Getting Testnet ETH

To test the wallet, you'll need testnet ETH. Get free Sepolia ETH from these faucets:

- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
- [QuickNode Faucet](https://faucet.quicknode.com/ethereum/sepolia)

## Security Best Practices

⚠️ **IMPORTANT SECURITY WARNINGS**:

1. **Never share your private key or mnemonic phrase** with anyone
2. **This is for learning purposes** - Use testnet first before mainnet
3. **Encrypted wallets are only as secure as your password** - Use a strong password
4. **Keep your `.env` file private** - Never commit it to version control
5. **The wallets directory is gitignored** - Don't accidentally commit it
6. **For production use**, consider hardware wallets or established wallet solutions

## Project Structure

```
token-wallet/
├── src/                # CLI backend
│   ├── index.js        # CLI interface and command definitions
│   ├── wallet.js       # Wallet creation, import, and management
│   ├── balance.js      # Balance checking functionality
│   ├── transaction.js  # Transaction sending functionality
│   ├── history.js      # Transaction history via Etherscan API
│   └── config.js       # Network configuration
├── frontend/           # React web interface
│   ├── src/
│   │   ├── components/ # React components
│   │   │   ├── wallet/        # Wallet connection components
│   │   │   ├── balance/       # Balance display components
│   │   │   ├── transaction/   # Send transaction components
│   │   │   └── history/       # Transaction history components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── services/   # API and blockchain services
│   │   ├── store/      # State management (Zustand)
│   │   ├── config/     # Network configuration
│   │   ├── App.jsx     # Main app component
│   │   └── main.jsx    # Entry point
│   ├── public/         # Static assets
│   ├── .env            # Frontend environment variables (gitignored)
│   ├── .env.example    # Example frontend configuration
│   ├── vite.config.js  # Vite configuration
│   └── package.json    # Frontend dependencies
├── contracts/          # Smart contracts
│   └── MyToken.sol     # Example ERC-20 token
├── wallets/            # Encrypted wallet files (gitignored)
├── .env                # CLI environment variables (gitignored)
├── .env.example        # Example CLI configuration
├── package.json        # CLI dependencies
└── README.md          # This file
```

## Supported Networks

- **Sepolia** (default) - Ethereum testnet
- **Goerli** - Ethereum testnet (being deprecated)
- **Mainnet** - Ethereum main network (use with caution!)

To change networks, edit the `NETWORK` variable in your `.env` file.

## Advanced: Deploy Your Own ERC-20 Token

This project includes tools to deploy your own ERC-20 token on Sepolia testnet!

### Compile the Token Contract

```bash
node compile-contract.js
```

This compiles the `contracts/MyToken.sol` contract and saves the ABI and bytecode to `artifacts/MyToken.json`.

### Deploy the Token

1. Make sure you have testnet ETH in your wallet
2. Create a `test-wallet-info.txt` file with your wallet details (see template)
3. Run the deployment script:

```bash
node deploy-token.js
```

The script will:
- Deploy the ERC-20 token contract
- Mint 1,000,000 tokens to your address
- Save deployment info to `deployment-info.json`
- Show you the contract address

### Interact with Your Token

Once deployed, you can use the wallet CLI to interact with your token:

```bash
# Check your token balance
npm start -- balance YOUR_ADDRESS --token TOKEN_CONTRACT_ADDRESS

# Send tokens (using the interactive CLI)
npm start -- send RECIPIENT_ADDRESS AMOUNT --token TOKEN_CONTRACT_ADDRESS
```

### Example Token Contract

The included `contracts/MyToken.sol` is a simple ERC-20 implementation with:
- Standard transfer and approval functions
- 18 decimals (standard for most tokens)
- Configurable name, symbol, and initial supply
- Well-commented code for learning

Feel free to modify the contract and experiment!

## Troubleshooting

### "Invalid RPC URL" or connection errors
- Check that your RPC URL in `.env` is correct
- Verify your Infura/Alchemy API key is valid
- Try using a public RPC endpoint (less reliable but works for testing)

### "Insufficient funds for transaction + gas"
- Make sure you have enough ETH to cover both the transfer amount and gas fees
- Get testnet ETH from faucets listed above

### "No transactions found" in history
- Ensure your Etherscan API key is set in `.env`
- The address may genuinely have no transactions on this network

### "Incorrect password" when loading wallet
- Double-check your password
- Wallet files cannot be recovered without the correct password

## Learning Resources

- [Ethers.js Documentation](https://docs.ethers.org/)
- [Ethereum.org Developer Docs](https://ethereum.org/en/developers/docs/)
- [Solidity by Example](https://solidity-by-example.org/)
- [ERC-20 Token Standard](https://eips.ethereum.org/EIPS/eip-20)

## License

ISC

## Contributing

This is a learning project! Feel free to fork and experiment.
