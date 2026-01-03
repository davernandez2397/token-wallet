import { ethers } from 'ethers';
import { getNetworkByChainId } from '../config/networks';

/**
 * Get Etherscan API V2 configuration
 * @param {number} chainId - Chain ID
 * @returns {Object} - API configuration
 */
function getEtherscanApiConfig(chainId) {
  return {
    baseUrl: 'https://api.etherscan.io/v2/api',
    chainId,
    apiKey: import.meta.env.VITE_ETHERSCAN_API_KEY || ''
  };
}

/**
 * Fetch transaction history from Etherscan API V2
 * @param {string} address - Ethereum address
 * @param {number} chainId - Chain ID
 * @param {number} limit - Maximum number of transactions
 * @returns {Promise<Array>} - Array of transactions
 */
export async function getTransactionHistory(address, chainId, limit = 20) {
  try {
    if (!ethers.isAddress(address)) {
      throw new Error('Invalid Ethereum address');
    }

    const apiConfig = getEtherscanApiConfig(chainId);

    if (!apiConfig.apiKey) {
      console.warn('No Etherscan API key configured. Transaction history may be limited.');
      // Return empty array if no API key - don't throw error
      return [];
    }

    const url = `${apiConfig.baseUrl}?chainid=${apiConfig.chainId}&module=account&action=txlist&address=${address}&page=1&offset=${limit}&sort=desc&apikey=${apiConfig.apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== '1') {
      if (data.message === 'No transactions found') {
        return [];
      }
      throw new Error(data.message || 'Failed to fetch transaction history');
    }

    // Format transactions for display
    return data.result.map(tx => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      valueFormatted: ethers.formatEther(tx.value),
      timestamp: parseInt(tx.timeStamp),
      date: new Date(parseInt(tx.timeStamp) * 1000),
      isError: tx.isError === '1',
      status: tx.isError === '0' ? 'success' : 'failed',
      gasUsed: tx.gasUsed,
      gasPrice: tx.gasPrice,
      blockNumber: tx.blockNumber
    }));
  } catch (error) {
    throw new Error(`Failed to fetch transaction history: ${error.message}`);
  }
}

/**
 * Fetch ERC-20 token transfer history from Etherscan API V2
 * @param {string} address - Ethereum address
 * @param {number} chainId - Chain ID
 * @param {string} tokenAddress - Optional token contract address filter
 * @param {number} limit - Maximum number of transfers
 * @returns {Promise<Array>} - Array of token transfers
 */
export async function getTokenTransferHistory(address, chainId, tokenAddress = null, limit = 20) {
  try {
    if (!ethers.isAddress(address)) {
      throw new Error('Invalid Ethereum address');
    }

    const apiConfig = getEtherscanApiConfig(chainId);

    if (!apiConfig.apiKey) {
      console.warn('No Etherscan API key configured.');
      return [];
    }

    let url = `${apiConfig.baseUrl}?chainid=${apiConfig.chainId}&module=account&action=tokentx&address=${address}&page=1&offset=${limit}&sort=desc&apikey=${apiConfig.apiKey}`;

    // Add token contract filter if provided
    if (tokenAddress && ethers.isAddress(tokenAddress)) {
      url += `&contractaddress=${tokenAddress}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== '1') {
      if (data.message === 'No transactions found') {
        return [];
      }
      throw new Error(data.message || 'Failed to fetch token transfer history');
    }

    // Format token transfers for display
    return data.result.map(tx => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      valueFormatted: ethers.formatUnits(tx.value, tx.tokenDecimal),
      timestamp: parseInt(tx.timeStamp),
      date: new Date(parseInt(tx.timeStamp) * 1000),
      tokenSymbol: tx.tokenSymbol,
      tokenName: tx.tokenName,
      tokenDecimal: tx.tokenDecimal,
      tokenAddress: tx.contractAddress,
      gasUsed: tx.gasUsed,
      gasPrice: tx.gasPrice,
      blockNumber: tx.blockNumber
    }));
  } catch (error) {
    throw new Error(`Failed to fetch token transfer history: ${error.message}`);
  }
}

/**
 * Get combined transaction history (ETH + tokens)
 * @param {string} address - Ethereum address
 * @param {number} chainId - Chain ID
 * @param {number} limit - Maximum transactions per type
 * @returns {Promise<Object>} - Object with eth and token transactions
 */
export async function getCombinedHistory(address, chainId, limit = 10) {
  try {
    const [ethTxs, tokenTxs] = await Promise.allSettled([
      getTransactionHistory(address, chainId, limit),
      getTokenTransferHistory(address, chainId, null, limit)
    ]);

    return {
      ethTransactions: ethTxs.status === 'fulfilled' ? ethTxs.value : [],
      tokenTransfers: tokenTxs.status === 'fulfilled' ? tokenTxs.value : [],
      hasEtherscanApiKey: !!getEtherscanApiConfig(chainId).apiKey
    };
  } catch (error) {
    throw new Error(`Failed to fetch combined history: ${error.message}`);
  }
}
