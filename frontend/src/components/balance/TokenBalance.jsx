import { useState } from 'react';
import { useMultipleTokenBalances } from '../../hooks/useBalance';
import { formatTokenAmount } from '../../config/networks';
import AddToken from './AddToken';

export default function TokenBalance() {
  // Default token: MTT test token deployed on Sepolia
  const [tokenAddresses, setTokenAddresses] = useState([
    '0x3f17EB051a65e6AED34DfaC2D02bdD105c25D57d'
  ]);
  const [showAddToken, setShowAddToken] = useState(false);

  const { data: tokens, isLoading, isError, error } = useMultipleTokenBalances(tokenAddresses);

  const handleAddToken = (tokenAddress) => {
    if (!tokenAddresses.includes(tokenAddress)) {
      setTokenAddresses([...tokenAddresses, tokenAddress]);
    }
    setShowAddToken(false);
  };

  const handleRemoveToken = (tokenAddress) => {
    setTokenAddresses(tokenAddresses.filter(addr => addr !== tokenAddress));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Balances</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Token Balances</h3>
        <button
          onClick={() => setShowAddToken(!showAddToken)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Token
        </button>
      </div>

      {showAddToken && (
        <div className="mb-4">
          <AddToken onAdd={handleAddToken} onCancel={() => setShowAddToken(false)} />
        </div>
      )}

      {isError && (
        <div className="text-red-600 text-sm mb-4">
          Error loading tokens: {error?.message}
        </div>
      )}

      {!tokens || tokens.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-sm">No tokens added yet</p>
          <p className="text-xs text-gray-400 mt-1">Click "Add Token" to track ERC-20 tokens</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tokens.map((token) => (
            <div
              key={token.tokenAddress}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {token.symbol?.substring(0, 2) || 'T'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{token.symbol || 'Unknown'}</p>
                    <span className="text-xs text-gray-500">{token.name || ''}</span>
                  </div>
                  <p className="text-xs text-gray-500 font-mono">
                    {token.tokenAddress.slice(0, 10)}...{token.tokenAddress.slice(-8)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatTokenAmount(token.balanceFormatted, token.decimals)}
                  </p>
                  <p className="text-xs text-gray-500">{token.symbol}</p>
                </div>
                <button
                  onClick={() => handleRemoveToken(token.tokenAddress)}
                  className="text-gray-400 hover:text-red-600 transition-colors p-1"
                  title="Remove token"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
