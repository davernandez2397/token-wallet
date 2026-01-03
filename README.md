# Ethereum Token Wallet CLI

A beginner-friendly command-line interface (CLI) wallet for interacting with Ethereum and ERC-20 tokens. Perfect for learning blockchain development!

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
├── src/
│   ├── index.js        # CLI interface and command definitions
│   ├── wallet.js       # Wallet creation, import, and management
│   ├── balance.js      # Balance checking functionality
│   ├── transaction.js  # Transaction sending functionality
│   ├── history.js      # Transaction history via Etherscan API
│   └── config.js       # Network configuration
├── wallets/            # Encrypted wallet files (gitignored)
├── .env                # Environment variables (gitignored)
├── .env.example        # Example environment configuration
├── package.json        # Project dependencies
└── README.md          # This file
```

## Supported Networks

- **Sepolia** (default) - Ethereum testnet
- **Goerli** - Ethereum testnet (being deprecated)
- **Mainnet** - Ethereum main network (use with caution!)

To change networks, edit the `NETWORK` variable in your `.env` file.

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
