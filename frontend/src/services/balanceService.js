import { ethers, Contract, JsonRpcProvider } from 'ethers';
import { NETWORKS, ERC20_ABI } from '../config/networks';

/**
 * Get provider instance for read-only operations
 * @param {number} chainId - Chain ID to get provider for
 * @returns {JsonRpcProvider}
 */
export function getProvider(chainId = 11155111) {
  const network = Object.values(NETWORKS).find(n => n.chainId === chainId);
  if (!network) {
    throw new Error(`Unsupported network with chainId: ${chainId}`);
  }
  return new JsonRpcProvider(network.rpcUrl);
}

/**
 * Get ETH balance for an address
 * @param {string} address - Ethereum address
 * @param {number} chainId - Chain ID
 * @returns {Promise<Object>} - Balance information
 */
export async function getEthBalance(address, chainId = 11155111) {
  try {
    if (!ethers.isAddress(address)) {
      throw new Error('Invalid Ethereum address');
    }

    const provider = getProvider(chainId);
    const balance = await provider.getBalance(address);
    const balanceFormatted = ethers.formatEther(balance);

    const network = Object.values(NETWORKS).find(n => n.chainId === chainId);

    return {
      balance: balance.toString(),
      balanceFormatted,
      currency: network?.currency || 'ETH',
      address
    };
  } catch (error) {
    throw new Error(`Failed to fetch balance: ${error.message}`);
  }
}

/**
 * Get ERC-20 token balance for an address
 * @param {string} address - Ethereum address
 * @param {string} tokenAddress - ERC-20 token contract address
 * @param {number} chainId - Chain ID
 * @returns {Promise<Object>} - Token balance information
 */
export async function getTokenBalance(address, tokenAddress, chainId = 11155111) {
  try {
    if (!ethers.isAddress(address)) {
      throw new Error('Invalid Ethereum address');
    }
    if (!ethers.isAddress(tokenAddress)) {
      throw new Error('Invalid token contract address');
    }

    const provider = getProvider(chainId);

    // Create contract instance
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);

    // Fetch token info and balance in parallel
    const [balance, decimals, symbol, name] = await Promise.all([
      tokenContract.balanceOf(address),
      tokenContract.decimals(),
      tokenContract.symbol(),
      tokenContract.name()
    ]);

    // Format balance based on token decimals
    const balanceFormatted = ethers.formatUnits(balance, decimals);

    return {
      balance: balance.toString(),
      balanceFormatted,
      decimals: Number(decimals),
      symbol,
      name,
      tokenAddress,
      address
    };
  } catch (error) {
    if (error.code === 'CALL_EXCEPTION') {
      throw new Error('Invalid token contract address or not an ERC-20 token');
    }
    throw new Error(`Failed to fetch token balance: ${error.message}`);
  }
}

/**
 * Get multiple token balances for an address
 * @param {string} address - Ethereum address
 * @param {Array<string>} tokenAddresses - Array of ERC-20 token contract addresses
 * @param {number} chainId - Chain ID
 * @returns {Promise<Array>} - Array of token balance information
 */
export async function getMultipleTokenBalances(address, tokenAddresses, chainId = 11155111) {
  try {
    const balances = await Promise.allSettled(
      tokenAddresses.map(tokenAddress =>
        getTokenBalance(address, tokenAddress, chainId)
      )
    );

    return balances
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);
  } catch (error) {
    throw new Error(`Failed to fetch token balances: ${error.message}`);
  }
}
