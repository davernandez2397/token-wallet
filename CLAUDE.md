# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a beginner-friendly Ethereum token wallet CLI application built with Node.js and ethers.js. It allows users to create/import wallets, check balances, send ETH/ERC-20 tokens, and view transaction history. The project is configured to use Sepolia testnet by default for safe learning.

## Common Commands

### Development
```bash
# Run the CLI
npm start

# Run specific commands
npm start wallet create
npm start balance <address>
npm start send <to> <amount>
npm start history <address>

# Install dependencies
npm install

# View network configuration
npm start info
```

### Testing on Sepolia
```bash
# The project defaults to Sepolia testnet
# Get test ETH from: https://sepoliafaucet.com/

# Example workflow:
npm start wallet create              # Create a new wallet
npm start balance <your-address>     # Check balance (should be 0)
# Get testnet ETH from faucet
npm start balance <your-address>     # Verify you received ETH
npm start send <recipient> 0.01      # Send some ETH
```

## Architecture

### Core Modules

**`src/config.js`** - Network Configuration
- Defines network settings (Sepolia, Goerli, Mainnet)
- Loads environment variables via dotenv
- Exports ERC-20 ABI for token interactions
- Network is determined by `NETWORK` env variable

**`src/wallet.js`** - Wallet Management
- `createWallet()`: Generates random wallet with mnemonic using ethers.Wallet.createRandom()
- `importWallet(input)`: Imports from private key or mnemonic phrase
- `saveWallet()`: Encrypts wallet with password using ethers.Wallet.encrypt()
- `loadWallet()`: Decrypts wallet from JSON file using ethers.Wallet.fromEncryptedJson()
- `listWallets()`: Lists all saved wallets from wallets/ directory
- Wallets stored as encrypted JSON in `wallets/` directory

**`src/balance.js`** - Balance Queries
- `getEthBalance(address)`: Uses provider.getBalance() to fetch ETH balance
- `getTokenBalance(address, tokenAddress)`: Creates ERC-20 contract instance and calls balanceOf()
- `getProvider()`: Creates JsonRpcProvider instance with RPC URL from config
- Formats wei to ETH using ethers.formatEther() and ethers.formatUnits()

**`src/transaction.js`** - Transaction Sending
- `sendEth(wallet, to, amount)`: Sends native ETH via wallet.sendTransaction()
- `sendToken(wallet, to, amount, tokenAddress)`: Sends ERC-20 tokens via contract.transfer()
- Estimates gas before sending using estimateGas()
- Requires user confirmation via inquirer prompts
- Returns transaction receipt after waiting for confirmation

**`src/history.js`** - Transaction History
- `getTransactionHistory()`: Fetches ETH transactions via Etherscan API
- `getTokenTransferHistory()`: Fetches ERC-20 transfers via Etherscan API
- Requires ETHERSCAN_API_KEY in .env for full functionality
- Formats and displays transactions with direction (sent/received), amounts, dates

**`src/index.js`** - CLI Interface
- Uses commander.js to define CLI commands and options
- Commands: wallet (create/import/list), balance, send, history, info
- Integrates all modules and handles user interaction via inquirer
- Entry point for the application (#!/usr/bin/env node)

### Key Dependencies

- **ethers.js v6**: Ethereum library for wallet management, transaction signing, contract interaction
- **commander**: CLI framework for command definitions and argument parsing
- **inquirer**: Interactive prompts for user input (passwords, confirmations)
- **chalk v4**: Terminal string styling (colors, formatting)
- **dotenv**: Environment variable management from .env file

### Data Flow

1. **Wallet Creation Flow**:
   - User runs `wallet create` → `createWalletInteractive()` → `createWallet()` generates random wallet
   - Mnemonic displayed to user → Optional: `saveWallet()` encrypts and saves to JSON

2. **Send Transaction Flow**:
   - User runs `send <to> <amount>` → CLI lists saved wallets
   - User selects wallet and enters password → `loadWallet()` decrypts wallet
   - For ETH: `sendEth()` creates transaction → Estimates gas → User confirms → Sends and waits
   - For tokens: `sendToken()` creates contract instance → Checks balance → Estimates gas → User confirms → Sends

3. **Balance Check Flow**:
   - User runs `balance <address>` → `checkBalance()` → `getEthBalance()` queries provider
   - If --token flag: `getTokenBalance()` queries ERC-20 contract
   - Results formatted and displayed with explorer link

### Security Model

- Wallets encrypted with password using ethers.js encryption (scrypt + AES-128-CTR)
- Private keys never stored in plaintext
- `.env` and `wallets/` directory in .gitignore to prevent accidental commits
- Testnet default prevents accidental mainnet transactions
- User confirmation required before sending transactions

### Environment Configuration

Required `.env` variables:
- `ETHEREUM_RPC_URL`: RPC endpoint (Infura/Alchemy URL with API key)
- `NETWORK`: sepolia, goerli, or mainnet
- `ETHERSCAN_API_KEY`: Optional, for transaction history feature

### Network Switching

To switch networks, update `NETWORK` in `.env`:
- `sepolia` - Ethereum testnet (default, recommended for learning)
- `goerli` - Ethereum testnet (being deprecated)
- `mainnet` - Ethereum main network (real ETH, use with extreme caution)

RPC URLs and explorer URLs automatically adjust based on network setting in `src/config.js`.

### ERC-20 Token Support

The project uses a minimal ERC-20 ABI defined in `config.js`:
- `balanceOf(address)`: Get token balance
- `decimals()`: Get token decimal places
- `symbol()`: Get token symbol
- `transfer(address, uint256)`: Send tokens
- `Transfer` event: For tracking transfers

To interact with any ERC-20 token, just provide its contract address.

### Error Handling Patterns

- Ethers.js errors include specific codes (e.g., `INSUFFICIENT_FUNDS`, `CALL_EXCEPTION`)
- Check for these codes to provide user-friendly error messages
- All async functions wrapped in try/catch with chalk.red error display
- Invalid addresses validated using `ethers.isAddress()`

### File Storage

- Encrypted wallets stored in `wallets/` as JSON files
- Filename format: `<name-lowercase-dashed>.json`
- Each wallet file contains: name, address, encrypted JSON, createdAt timestamp
- Directory created automatically if it doesn't exist

### Extension Points

Common areas for enhancement:
- Add HD wallet support (multiple accounts from one seed)
- Implement transaction signing for contract interactions
- Add NFT (ERC-721/ERC-1155) support
- Batch transaction support
- Add gas price optimization (EIP-1559 priority fees)
- Implement wallet backup/export functionality
- Add support for other EVM chains (Polygon, BSC, Arbitrum)
