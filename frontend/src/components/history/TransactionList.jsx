import { useState } from 'react';
import { useCombinedHistory } from '../../hooks/useHistory';
import { useWallet } from '../../hooks/useWallet';
import { formatTokenAmount, getNetworkByChainId } from '../../config/networks';

export default function TransactionList() {
  const { address, chainId } = useWallet();
  const { data, isLoading, isError, error } = useCombinedHistory(10);
  const [filter, setFilter] = useState('all'); // 'all', 'eth', 'tokens'

  const networkInfo = getNetworkByChainId(chainId);
  const explorerUrl = networkInfo?.explorerUrl || 'https://sepolia.etherscan.io';

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
        <div className="text-red-600 text-sm">
          Error loading history: {error?.message}
        </div>
      </div>
    );
  }

  // Show warning if no API key
  if (!data?.hasEtherscanApiKey) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">Etherscan API Key Required</h4>
              <p className="text-sm text-yellow-800 mb-2">
                Transaction history requires an Etherscan API key. Get a free key at{' '}
                <a href="https://etherscan.io/apis" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-900">
                  etherscan.io/apis
                </a>
              </p>
              <p className="text-xs text-yellow-700">
                Add it to your <code className="bg-yellow-100 px-1 rounded">.env</code> file as <code className="bg-yellow-100 px-1 rounded">VITE_ETHERSCAN_API_KEY</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const ethTxs = data?.ethTransactions || [];
  const tokenTxs = data?.tokenTransfers || [];

  // Combine and sort all transactions
  const allTxs = [
    ...ethTxs.map(tx => ({ ...tx, type: 'eth' })),
    ...tokenTxs.map(tx => ({ ...tx, type: 'token' }))
  ].sort((a, b) => b.timestamp - a.timestamp);

  // Filter transactions
  const filteredTxs = allTxs.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'eth') return tx.type === 'eth';
    if (filter === 'tokens') return tx.type === 'token';
    return true;
  });

  const getDirection = (tx) => {
    return tx.to?.toLowerCase() === address?.toLowerCase() ? 'received' : 'sent';
  };

  const getCounterparty = (tx) => {
    const direction = getDirection(tx);
    return direction === 'received' ? tx.from : tx.to;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All ({allTxs.length})
          </button>
          <button
            onClick={() => setFilter('eth')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              filter === 'eth'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ETH ({ethTxs.length})
          </button>
          <button
            onClick={() => setFilter('tokens')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              filter === 'tokens'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tokens ({tokenTxs.length})
          </button>
        </div>
      </div>

      {filteredTxs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">No transactions found</p>
          <p className="text-xs text-gray-400 mt-1">Your transaction history will appear here</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredTxs.map((tx) => {
            const direction = getDirection(tx);
            const counterparty = getCounterparty(tx);
            const isReceived = direction === 'received';

            return (
              <div
                key={tx.hash}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  {/* Direction Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isReceived ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <svg className={`w-5 h-5 ${isReceived ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isReceived ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      )}
                    </svg>
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-semibold ${isReceived ? 'text-green-600' : 'text-red-600'}`}>
                        {isReceived ? 'Received' : 'Sent'}
                      </span>
                      {tx.type === 'token' && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          {tx.tokenSymbol}
                        </span>
                      )}
                      {tx.isError && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                          Failed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 font-mono truncate">
                      {isReceived ? 'From' : 'To'}: {counterparty?.slice(0, 10)}...{counterparty?.slice(-8)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {tx.date.toLocaleString()}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p className={`font-semibold ${isReceived ? 'text-green-600' : 'text-gray-900'}`}>
                      {isReceived ? '+' : '-'}{formatTokenAmount(tx.valueFormatted)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {tx.type === 'eth' ? networkInfo?.currency || 'ETH' : tx.tokenSymbol}
                    </p>
                  </div>

                  {/* Explorer Link */}
                  <a
                    href={`${explorerUrl}/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="View on Explorer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredTxs.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <a
            href={`${explorerUrl}/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1"
          >
            View all transactions on Etherscan
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}
