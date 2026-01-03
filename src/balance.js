const { ethers } = require('ethers');
const chalk = require('chalk');
const config = require('./config');

/**
 * Get provider instance
 * @returns {ethers.JsonRpcProvider}
 */
function getProvider() {
  return new ethers.JsonRpcProvider(config.network.rpcUrl);
}

/**
 * Check ETH balance for an address
 * @param {string} address - Ethereum address
 * @returns {Object} - Balance information
 */
async function getEthBalance(address) {
  try {
    const provider = getProvider();

    console.log(chalk.blue(`\nFetching ${config.network.currency} balance for ${address}...`));

    const balance = await provider.getBalance(address);
    const balanceInEth = ethers.formatEther(balance);

    console.log(chalk.green('\nBalance:'), chalk.cyan(`${balanceInEth} ${config.network.currency}`));
    console.log(chalk.gray(`Network: ${config.network.name}`));

    return {
      balance: balance.toString(),
      balanceFormatted: balanceInEth,
      currency: config.network.currency
    };
  } catch (error) {
    throw new Error(`Failed to fetch balance: ${error.message}`);
  }
}

/**
 * Check ERC-20 token balance for an address
 * @param {string} address - Ethereum address
 * @param {string} tokenAddress - ERC-20 token contract address
 * @returns {Object} - Token balance information
 */
async function getTokenBalance(address, tokenAddress) {
  try {
    const provider = getProvider();

    console.log(chalk.blue(`\nFetching token balance for ${address}...`));
    console.log(chalk.gray(`Token contract: ${tokenAddress}`));

    // Create contract instance
    const tokenContract = new ethers.Contract(
      tokenAddress,
      config.ERC20_ABI,
      provider
    );

    // Fetch token info and balance in parallel
    const [balance, decimals, symbol] = await Promise.all([
      tokenContract.balanceOf(address),
      tokenContract.decimals(),
      tokenContract.symbol()
    ]);

    // Format balance based on token decimals
    const balanceFormatted = ethers.formatUnits(balance, decimals);

    console.log(chalk.green('\nToken Balance:'), chalk.cyan(`${balanceFormatted} ${symbol}`));
    console.log(chalk.gray(`Network: ${config.network.name}`));

    return {
      balance: balance.toString(),
      balanceFormatted,
      decimals: decimals.toString(),
      symbol,
      tokenAddress
    };
  } catch (error) {
    if (error.code === 'CALL_EXCEPTION') {
      throw new Error('Invalid token contract address or not an ERC-20 token');
    }
    throw new Error(`Failed to fetch token balance: ${error.message}`);
  }
}

/**
 * Check both ETH and token balances for an address
 * @param {string} address - Ethereum address
 * @param {string} tokenAddress - Optional ERC-20 token contract address
 */
async function checkBalance(address, tokenAddress = null) {
  try {
    // Validate address
    if (!ethers.isAddress(address)) {
      throw new Error('Invalid Ethereum address');
    }

    // Get ETH balance
    await getEthBalance(address);

    // Get token balance if token address provided
    if (tokenAddress) {
      if (!ethers.isAddress(tokenAddress)) {
        throw new Error('Invalid token contract address');
      }
      await getTokenBalance(address, tokenAddress);
    }

    // Show explorer link
    const explorerUrl = `${config.network.explorerUrl}/address/${address}`;
    console.log(chalk.gray(`\nView on explorer: ${explorerUrl}`));
  } catch (error) {
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}

module.exports = {
  getEthBalance,
  getTokenBalance,
  checkBalance,
  getProvider
};
