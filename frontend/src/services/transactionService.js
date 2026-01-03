import { ethers, Contract } from 'ethers';
import { ERC20_ABI, getNetworkByChainId } from '../config/networks';

/**
 * Estimate gas and total cost for sending ETH
 * @param {Object} signer - Ethers signer from wallet
 * @param {string} toAddress - Recipient address
 * @param {string} amount - Amount in ETH
 * @returns {Promise<Object>} - Gas estimate and cost details
 */
export async function estimateEthTransfer(signer, toAddress, amount) {
  try {
    if (!ethers.isAddress(toAddress)) {
      throw new Error('Invalid recipient address');
    }

    const provider = signer.provider;
    const fromAddress = await signer.getAddress();
    const amountInWei = ethers.parseEther(amount);

    // Check balance
    const balance = await provider.getBalance(fromAddress);
    if (balance < amountInWei) {
      throw new Error('Insufficient balance');
    }

    // Estimate gas
    const gasEstimate = await provider.estimateGas({
      from: fromAddress,
      to: toAddress,
      value: amountInWei
    });

    // Get current gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;

    // Calculate costs
    const gasCost = gasEstimate * gasPrice;
    const gasCostInEth = ethers.formatEther(gasCost);
    const totalCost = ethers.formatEther(amountInWei + gasCost);

    // Get network info
    const network = await provider.getNetwork();
    const networkInfo = getNetworkByChainId(Number(network.chainId));

    return {
      gasEstimate: gasEstimate.toString(),
      gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
      gasCost: gasCostInEth,
      totalCost,
      currency: networkInfo?.currency || 'ETH'
    };
  } catch (error) {
    if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error('Insufficient funds for transaction + gas');
    }
    throw new Error(`Failed to estimate gas: ${error.message}`);
  }
}

/**
 * Send ETH to another address
 * @param {Object} signer - Ethers signer from wallet
 * @param {string} toAddress - Recipient address
 * @param {string} amount - Amount in ETH
 * @returns {Promise<Object>} - Transaction response
 */
export async function sendEth(signer, toAddress, amount) {
  try {
    if (!ethers.isAddress(toAddress)) {
      throw new Error('Invalid recipient address');
    }

    const amountInWei = ethers.parseEther(amount);

    // Send transaction
    const tx = await signer.sendTransaction({
      to: toAddress,
      value: amountInWei
    });

    return {
      hash: tx.hash,
      wait: () => tx.wait()
    };
  } catch (error) {
    if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error('Insufficient funds for transaction + gas');
    }
    if (error.code === 'ACTION_REJECTED') {
      throw new Error('Transaction rejected by user');
    }
    throw new Error(`Transaction failed: ${error.message}`);
  }
}

/**
 * Estimate gas for sending ERC-20 tokens
 * @param {Object} signer - Ethers signer from wallet
 * @param {string} toAddress - Recipient address
 * @param {string} amount - Amount of tokens
 * @param {string} tokenAddress - ERC-20 token contract address
 * @returns {Promise<Object>} - Gas estimate and cost details
 */
export async function estimateTokenTransfer(signer, toAddress, amount, tokenAddress) {
  try {
    if (!ethers.isAddress(toAddress)) {
      throw new Error('Invalid recipient address');
    }
    if (!ethers.isAddress(tokenAddress)) {
      throw new Error('Invalid token contract address');
    }

    const provider = signer.provider;
    const fromAddress = await signer.getAddress();

    // Create contract instance
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, signer);

    // Get token info
    const [decimals, symbol, balance] = await Promise.all([
      tokenContract.decimals(),
      tokenContract.symbol(),
      tokenContract.balanceOf(fromAddress)
    ]);

    // Parse amount based on token decimals
    const amountInUnits = ethers.parseUnits(amount, decimals);

    // Check if user has enough tokens
    if (balance < amountInUnits) {
      throw new Error(`Insufficient token balance. You have ${ethers.formatUnits(balance, decimals)} ${symbol}`);
    }

    // Estimate gas for token transfer
    const gasEstimate = await tokenContract.transfer.estimateGas(toAddress, amountInUnits);

    // Get current gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;

    // Calculate gas cost in ETH
    const gasCost = gasEstimate * gasPrice;
    const gasCostInEth = ethers.formatEther(gasCost);

    // Get network info
    const network = await provider.getNetwork();
    const networkInfo = getNetworkByChainId(Number(network.chainId));

    // Check if user has enough ETH for gas
    const ethBalance = await provider.getBalance(fromAddress);
    if (ethBalance < gasCost) {
      throw new Error(`Insufficient ETH for gas fees. Need ${gasCostInEth} ${networkInfo?.currency || 'ETH'}`);
    }

    return {
      gasEstimate: gasEstimate.toString(),
      gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
      gasCost: gasCostInEth,
      currency: networkInfo?.currency || 'ETH',
      tokenSymbol: symbol,
      tokenDecimals: Number(decimals)
    };
  } catch (error) {
    if (error.code === 'CALL_EXCEPTION') {
      throw new Error('Invalid token contract or transfer failed');
    }
    throw error;
  }
}

/**
 * Send ERC-20 tokens to another address
 * @param {Object} signer - Ethers signer from wallet
 * @param {string} toAddress - Recipient address
 * @param {string} amount - Amount of tokens
 * @param {string} tokenAddress - ERC-20 token contract address
 * @returns {Promise<Object>} - Transaction response
 */
export async function sendToken(signer, toAddress, amount, tokenAddress) {
  try {
    if (!ethers.isAddress(toAddress)) {
      throw new Error('Invalid recipient address');
    }
    if (!ethers.isAddress(tokenAddress)) {
      throw new Error('Invalid token contract address');
    }

    // Create contract instance
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, signer);

    // Get token decimals
    const decimals = await tokenContract.decimals();

    // Parse amount based on token decimals
    const amountInUnits = ethers.parseUnits(amount, decimals);

    // Send token transfer transaction
    const tx = await tokenContract.transfer(toAddress, amountInUnits);

    return {
      hash: tx.hash,
      wait: () => tx.wait()
    };
  } catch (error) {
    if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error('Insufficient ETH for gas fees');
    }
    if (error.code === 'ACTION_REJECTED') {
      throw new Error('Transaction rejected by user');
    }
    if (error.code === 'CALL_EXCEPTION') {
      throw new Error('Invalid token contract or transfer failed');
    }
    throw new Error(`Token transfer failed: ${error.message}`);
  }
}
