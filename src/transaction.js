const { ethers } = require('ethers');
const chalk = require('chalk');
const inquirer = require('inquirer');
const config = require('./config');
const { getProvider } = require('./balance');

/**
 * Send ETH to another address
 * @param {ethers.Wallet} wallet - Sender wallet
 * @param {string} toAddress - Recipient address
 * @param {string} amount - Amount in ETH
 * @returns {Object} - Transaction receipt
 */
async function sendEth(wallet, toAddress, amount) {
  try {
    // Validate addresses
    if (!ethers.isAddress(toAddress)) {
      throw new Error('Invalid recipient address');
    }

    // Connect wallet to provider
    const provider = getProvider();
    const connectedWallet = wallet.connect(provider);

    // Parse amount
    const amountInWei = ethers.parseEther(amount);

    console.log(chalk.blue('\nPreparing transaction...'));
    console.log(chalk.white('From:'), chalk.cyan(wallet.address));
    console.log(chalk.white('To:'), chalk.cyan(toAddress));
    console.log(chalk.white('Amount:'), chalk.cyan(`${amount} ${config.network.currency}`));

    // Estimate gas
    const gasEstimate = await provider.estimateGas({
      to: toAddress,
      value: amountInWei
    });

    // Get current gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;

    // Calculate total cost
    const gasCost = gasEstimate * gasPrice;
    const gasCostInEth = ethers.formatEther(gasCost);
    const totalCost = ethers.formatEther(amountInWei + gasCost);

    console.log(chalk.gray(`\nEstimated gas: ${gasEstimate.toString()}`));
    console.log(chalk.gray(`Gas price: ${ethers.formatUnits(gasPrice, 'gwei')} Gwei`));
    console.log(chalk.gray(`Gas cost: ~${gasCostInEth} ${config.network.currency}`));
    console.log(chalk.yellow(`Total cost: ~${totalCost} ${config.network.currency}`));

    // Confirm transaction
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Do you want to proceed with this transaction?',
        default: false
      }
    ]);

    if (!confirm) {
      console.log(chalk.yellow('\nTransaction cancelled.'));
      return null;
    }

    console.log(chalk.blue('\nSending transaction...'));

    // Send transaction
    const tx = await connectedWallet.sendTransaction({
      to: toAddress,
      value: amountInWei
    });

    console.log(chalk.green('\nTransaction sent!'));
    console.log(chalk.white('Transaction hash:'), chalk.cyan(tx.hash));
    console.log(chalk.gray(`${config.network.explorerUrl}/tx/${tx.hash}`));

    console.log(chalk.blue('\nWaiting for confirmation...'));
    const receipt = await tx.wait();

    console.log(chalk.green('\nTransaction confirmed!'));
    console.log(chalk.white('Block number:'), chalk.cyan(receipt.blockNumber));
    console.log(chalk.white('Gas used:'), chalk.cyan(receipt.gasUsed.toString()));

    return receipt;
  } catch (error) {
    if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error('Insufficient funds for transaction + gas');
    }
    throw new Error(`Transaction failed: ${error.message}`);
  }
}

/**
 * Send ERC-20 tokens to another address
 * @param {ethers.Wallet} wallet - Sender wallet
 * @param {string} toAddress - Recipient address
 * @param {string} amount - Amount of tokens
 * @param {string} tokenAddress - ERC-20 token contract address
 * @returns {Object} - Transaction receipt
 */
async function sendToken(wallet, toAddress, amount, tokenAddress) {
  try {
    // Validate addresses
    if (!ethers.isAddress(toAddress)) {
      throw new Error('Invalid recipient address');
    }
    if (!ethers.isAddress(tokenAddress)) {
      throw new Error('Invalid token contract address');
    }

    // Connect wallet to provider
    const provider = getProvider();
    const connectedWallet = wallet.connect(provider);

    // Create contract instance
    const tokenContract = new ethers.Contract(
      tokenAddress,
      config.ERC20_ABI,
      connectedWallet
    );

    // Get token info
    const [decimals, symbol, balance] = await Promise.all([
      tokenContract.decimals(),
      tokenContract.symbol(),
      tokenContract.balanceOf(wallet.address)
    ]);

    // Parse amount based on token decimals
    const amountInUnits = ethers.parseUnits(amount, decimals);

    // Check if user has enough tokens
    if (balance < amountInUnits) {
      throw new Error(`Insufficient token balance. You have ${ethers.formatUnits(balance, decimals)} ${symbol}`);
    }

    console.log(chalk.blue('\nPreparing token transfer...'));
    console.log(chalk.white('From:'), chalk.cyan(wallet.address));
    console.log(chalk.white('To:'), chalk.cyan(toAddress));
    console.log(chalk.white('Amount:'), chalk.cyan(`${amount} ${symbol}`));
    console.log(chalk.gray(`Token: ${tokenAddress}`));

    // Estimate gas for token transfer
    const gasEstimate = await tokenContract.transfer.estimateGas(toAddress, amountInUnits);

    // Get current gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;

    // Calculate gas cost in ETH
    const gasCost = gasEstimate * gasPrice;
    const gasCostInEth = ethers.formatEther(gasCost);

    console.log(chalk.gray(`\nEstimated gas: ${gasEstimate.toString()}`));
    console.log(chalk.gray(`Gas price: ${ethers.formatUnits(gasPrice, 'gwei')} Gwei`));
    console.log(chalk.yellow(`Gas cost: ~${gasCostInEth} ${config.network.currency}`));

    // Confirm transaction
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Do you want to proceed with this token transfer?',
        default: false
      }
    ]);

    if (!confirm) {
      console.log(chalk.yellow('\nTransaction cancelled.'));
      return null;
    }

    console.log(chalk.blue('\nSending transaction...'));

    // Send token transfer transaction
    const tx = await tokenContract.transfer(toAddress, amountInUnits);

    console.log(chalk.green('\nTransaction sent!'));
    console.log(chalk.white('Transaction hash:'), chalk.cyan(tx.hash));
    console.log(chalk.gray(`${config.network.explorerUrl}/tx/${tx.hash}`));

    console.log(chalk.blue('\nWaiting for confirmation...'));
    const receipt = await tx.wait();

    console.log(chalk.green('\nToken transfer confirmed!'));
    console.log(chalk.white('Block number:'), chalk.cyan(receipt.blockNumber));
    console.log(chalk.white('Gas used:'), chalk.cyan(receipt.gasUsed.toString()));

    return receipt;
  } catch (error) {
    if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error('Insufficient ETH for gas fees');
    }
    if (error.code === 'CALL_EXCEPTION') {
      throw new Error('Invalid token contract or transfer failed');
    }
    throw new Error(`Token transfer failed: ${error.message}`);
  }
}

module.exports = {
  sendEth,
  sendToken
};
