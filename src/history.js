const { ethers } = require('ethers');
const chalk = require('chalk');
const config = require('./config');

/**
 * Get Etherscan API V2 base URL and chain ID
 * @returns {Object} - API URL and chain ID
 */
function getEtherscanApiConfig() {
  // V2 API uses a single endpoint with chainid parameter
  return {
    baseUrl: 'https://api.etherscan.io/v2/api',
    chainId: config.network.chainId
  };
}

/**
 * Fetch transaction history from Etherscan
 * @param {string} address - Ethereum address
 * @param {number} limit - Maximum number of transactions to fetch
 * @returns {Array} - Array of transactions
 */
async function getTransactionHistory(address, limit = 10) {
  try {
    // Validate address
    if (!ethers.isAddress(address)) {
      throw new Error('Invalid Ethereum address');
    }

    if (!config.etherscanApiKey) {
      console.log(chalk.yellow('\nWarning: No Etherscan API key configured.'));
      console.log(chalk.yellow('Transaction history feature requires an API key.'));
      console.log(chalk.gray('Get a free key at: https://etherscan.io/apis'));
      console.log(chalk.gray('Then add it to your .env file as ETHERSCAN_API_KEY'));
      return [];
    }

    console.log(chalk.blue(`\nFetching transaction history for ${address}...`));

    const apiConfig = getEtherscanApiConfig();
    const url = `${apiConfig.baseUrl}?chainid=${apiConfig.chainId}&module=account&action=txlist&address=${address}&page=1&offset=${limit}&sort=desc&apikey=${config.etherscanApiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== '1') {
      if (data.message === 'No transactions found') {
        console.log(chalk.yellow('\nNo transactions found for this address.'));
        return [];
      }
      throw new Error(data.message || 'Failed to fetch transaction history');
    }

    return data.result;
  } catch (error) {
    throw new Error(`Failed to fetch transaction history: ${error.message}`);
  }
}

/**
 * Fetch ERC-20 token transfer history from Etherscan
 * @param {string} address - Ethereum address
 * @param {string} tokenAddress - Optional token contract address filter
 * @param {number} limit - Maximum number of transfers to fetch
 * @returns {Array} - Array of token transfers
 */
async function getTokenTransferHistory(address, tokenAddress = null, limit = 10) {
  try {
    // Validate address
    if (!ethers.isAddress(address)) {
      throw new Error('Invalid Ethereum address');
    }

    if (!config.etherscanApiKey) {
      console.log(chalk.yellow('\nWarning: No Etherscan API key configured.'));
      return [];
    }

    console.log(chalk.blue(`\nFetching token transfer history for ${address}...`));

    const apiConfig = getEtherscanApiConfig();
    let url = `${apiConfig.baseUrl}?chainid=${apiConfig.chainId}&module=account&action=tokentx&address=${address}&page=1&offset=${limit}&sort=desc&apikey=${config.etherscanApiKey}`;

    // Add token contract filter if provided
    if (tokenAddress && ethers.isAddress(tokenAddress)) {
      url += `&contractaddress=${tokenAddress}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== '1') {
      if (data.message === 'No transactions found') {
        console.log(chalk.yellow('\nNo token transfers found for this address.'));
        return [];
      }
      throw new Error(data.message || 'Failed to fetch token transfer history');
    }

    return data.result;
  } catch (error) {
    throw new Error(`Failed to fetch token transfer history: ${error.message}`);
  }
}

/**
 * Display transaction history in a formatted table
 * @param {string} address - Ethereum address
 * @param {Object} options - Options (limit, token address)
 */
async function displayTransactionHistory(address, options = {}) {
  try {
    const limit = options.limit || 10;
    const tokenAddress = options.token || null;

    // If token address is provided, fetch token transfers
    if (tokenAddress) {
      const transfers = await getTokenTransferHistory(address, tokenAddress, limit);

      if (transfers.length === 0) {
        return;
      }

      console.log(chalk.green(`\nFound ${transfers.length} token transfer(s):\n`));

      transfers.forEach((tx, index) => {
        const isReceived = tx.to.toLowerCase() === address.toLowerCase();
        const direction = isReceived ? chalk.green('← Received') : chalk.red('→ Sent');
        const counterparty = isReceived ? tx.from : tx.to;
        const amount = ethers.formatUnits(tx.value, tx.tokenDecimal);
        const date = new Date(parseInt(tx.timeStamp) * 1000).toLocaleString();

        console.log(chalk.white(`${index + 1}.`), direction);
        console.log(chalk.gray(`   ${isReceived ? 'From' : 'To'}:     ${counterparty}`));
        console.log(chalk.cyan(`   Amount:   ${amount} ${tx.tokenSymbol}`));
        console.log(chalk.gray(`   Date:     ${date}`));
        console.log(chalk.gray(`   Tx Hash:  ${tx.hash}`));
        console.log(chalk.gray(`   ${config.network.explorerUrl}/tx/${tx.hash}\n`));
      });
    } else {
      // Fetch regular ETH transactions
      const transactions = await getTransactionHistory(address, limit);

      if (transactions.length === 0) {
        return;
      }

      console.log(chalk.green(`\nFound ${transactions.length} transaction(s):\n`));

      transactions.forEach((tx, index) => {
        const isReceived = tx.to.toLowerCase() === address.toLowerCase();
        const direction = isReceived ? chalk.green('← Received') : chalk.red('→ Sent');
        const counterparty = isReceived ? tx.from : tx.to;
        const amount = ethers.formatEther(tx.value);
        const date = new Date(parseInt(tx.timeStamp) * 1000).toLocaleString();
        const status = tx.isError === '0' ? chalk.green('Success') : chalk.red('Failed');

        console.log(chalk.white(`${index + 1}.`), direction);
        console.log(chalk.gray(`   ${isReceived ? 'From' : 'To'}:     ${counterparty}`));
        console.log(chalk.cyan(`   Amount:   ${amount} ${config.network.currency}`));
        console.log(chalk.gray(`   Date:     ${date}`));
        console.log(chalk.gray(`   Status:   ${status}`));
        console.log(chalk.gray(`   Tx Hash:  ${tx.hash}`));
        console.log(chalk.gray(`   ${config.network.explorerUrl}/tx/${tx.hash}\n`));
      });
    }

    // Show explorer link
    const explorerUrl = `${config.network.explorerUrl}/address/${address}`;
    console.log(chalk.gray(`View all transactions: ${explorerUrl}`));
  } catch (error) {
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}

module.exports = {
  getTransactionHistory,
  getTokenTransferHistory,
  displayTransactionHistory
};
