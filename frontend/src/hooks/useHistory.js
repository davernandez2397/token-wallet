import { useQuery } from '@tanstack/react-query';
import {
  getTransactionHistory,
  getTokenTransferHistory,
  getCombinedHistory
} from '../services/historyService';
import { useWallet } from './useWallet';

/**
 * Hook to fetch ETH transaction history
 * @param {number} limit - Number of transactions to fetch
 * @returns {Object} - Query result with transaction data
 */
export function useTransactionHistory(limit = 20) {
  const { address, chainId, isConnected } = useWallet();

  return useQuery({
    queryKey: ['transactionHistory', address, chainId, limit],
    queryFn: () => getTransactionHistory(address, chainId, limit),
    enabled: isConnected && !!address && !!chainId,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Hook to fetch token transfer history
 * @param {string} tokenAddress - Optional token contract address filter
 * @param {number} limit - Number of transfers to fetch
 * @returns {Object} - Query result with token transfer data
 */
export function useTokenTransferHistory(tokenAddress = null, limit = 20) {
  const { address, chainId, isConnected } = useWallet();

  return useQuery({
    queryKey: ['tokenTransferHistory', address, chainId, tokenAddress, limit],
    queryFn: () => getTokenTransferHistory(address, chainId, tokenAddress, limit),
    enabled: isConnected && !!address && !!chainId,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

/**
 * Hook to fetch combined history (ETH + tokens)
 * @param {number} limit - Number of transactions per type
 * @returns {Object} - Query result with combined history
 */
export function useCombinedHistory(limit = 10) {
  const { address, chainId, isConnected } = useWallet();

  return useQuery({
    queryKey: ['combinedHistory', address, chainId, limit],
    queryFn: () => getCombinedHistory(address, chainId, limit),
    enabled: isConnected && !!address && !!chainId,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}
