import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWallet } from './useWallet';
import {
  estimateEthTransfer,
  sendEth,
  estimateTokenTransfer,
  sendToken
} from '../services/transactionService';

/**
 * Hook for sending transactions (ETH and tokens)
 * @returns {Object} - Transaction methods and state
 */
export function useTransaction() {
  const { signer, isConnected } = useWallet();
  const queryClient = useQueryClient();
  const [txHash, setTxHash] = useState(null);
  const [txStatus, setTxStatus] = useState('idle'); // idle, pending, confirmed, failed

  // Mutation for estimating ETH transfer
  const estimateEth = useMutation({
    mutationFn: ({ toAddress, amount }) => estimateEthTransfer(signer, toAddress, amount),
  });

  // Mutation for estimating token transfer
  const estimateToken = useMutation({
    mutationFn: ({ toAddress, amount, tokenAddress }) =>
      estimateTokenTransfer(signer, toAddress, amount, tokenAddress),
  });

  // Mutation for sending ETH
  const sendEthMutation = useMutation({
    mutationFn: async ({ toAddress, amount }) => {
      const tx = await sendEth(signer, toAddress, amount);
      setTxHash(tx.hash);
      setTxStatus('pending');

      // Wait for confirmation
      const receipt = await tx.wait();
      setTxStatus('confirmed');

      // Invalidate balance queries to refetch updated balances
      queryClient.invalidateQueries({ queryKey: ['ethBalance'] });

      return receipt;
    },
    onError: () => {
      setTxStatus('failed');
    }
  });

  // Mutation for sending tokens
  const sendTokenMutation = useMutation({
    mutationFn: async ({ toAddress, amount, tokenAddress }) => {
      const tx = await sendToken(signer, toAddress, amount, tokenAddress);
      setTxHash(tx.hash);
      setTxStatus('pending');

      // Wait for confirmation
      const receipt = await tx.wait();
      setTxStatus('confirmed');

      // Invalidate balance queries to refetch updated balances
      queryClient.invalidateQueries({ queryKey: ['ethBalance'] });
      queryClient.invalidateQueries({ queryKey: ['tokenBalance'] });
      queryClient.invalidateQueries({ queryKey: ['multipleTokenBalances'] });

      return receipt;
    },
    onError: () => {
      setTxStatus('failed');
    }
  });

  // Reset transaction state
  const resetTx = () => {
    setTxHash(null);
    setTxStatus('idle');
    sendEthMutation.reset();
    sendTokenMutation.reset();
  };

  return {
    // ETH estimation
    estimateEth: estimateEth.mutateAsync,
    isEstimatingEth: estimateEth.isPending,
    ethEstimate: estimateEth.data,
    ethEstimateError: estimateEth.error,

    // Token estimation
    estimateToken: estimateToken.mutateAsync,
    isEstimatingToken: estimateToken.isPending,
    tokenEstimate: estimateToken.data,
    tokenEstimateError: estimateToken.error,

    // Send ETH
    sendEth: sendEthMutation.mutateAsync,
    isSendingEth: sendEthMutation.isPending,
    sendEthError: sendEthMutation.error,

    // Send Token
    sendToken: sendTokenMutation.mutateAsync,
    isSendingToken: sendTokenMutation.isPending,
    sendTokenError: sendTokenMutation.error,

    // Transaction state
    txHash,
    txStatus,
    resetTx,
    isConnected
  };
}
