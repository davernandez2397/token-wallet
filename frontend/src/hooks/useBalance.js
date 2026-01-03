import { useQuery } from '@tanstack/react-query';
import { getEthBalance, getTokenBalance, getMultipleTokenBalances } from '../services/balanceService';
import { useWallet } from './useWallet';

/**
 * Hook to fetch and cache ETH balance
 * @returns {Object} - Query result with balance data
 */
export function useEthBalance() {
  const { address, chainId, isConnected } = useWallet();

  return useQuery({
    queryKey: ['ethBalance', address, chainId],
    queryFn: () => getEthBalance(address, chainId),
    enabled: isConnected && !!address && !!chainId,
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
  });
}

/**
 * Hook to fetch and cache ERC-20 token balance
 * @param {string} tokenAddress - ERC-20 token contract address
 * @returns {Object} - Query result with token balance data
 */
export function useTokenBalance(tokenAddress) {
  const { address, chainId, isConnected } = useWallet();

  return useQuery({
    queryKey: ['tokenBalance', address, tokenAddress, chainId],
    queryFn: () => getTokenBalance(address, tokenAddress, chainId),
    enabled: isConnected && !!address && !!tokenAddress && !!chainId,
    refetchInterval: 10000,
    staleTime: 5000,
  });
}

/**
 * Hook to fetch multiple token balances
 * @param {Array<string>} tokenAddresses - Array of ERC-20 token addresses
 * @returns {Object} - Query result with array of token balances
 */
export function useMultipleTokenBalances(tokenAddresses = []) {
  const { address, chainId, isConnected } = useWallet();

  return useQuery({
    queryKey: ['multipleTokenBalances', address, tokenAddresses, chainId],
    queryFn: () => getMultipleTokenBalances(address, tokenAddresses, chainId),
    enabled: isConnected && !!address && tokenAddresses.length > 0 && !!chainId,
    refetchInterval: 10000,
    staleTime: 5000,
  });
}
