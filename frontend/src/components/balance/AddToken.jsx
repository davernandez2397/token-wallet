import { useState } from 'react';
import { ethers } from 'ethers';
import Spinner from '../ui/Spinner';

export default function AddToken({ onAdd, onCancel }) {
  const [tokenAddress, setTokenAddress] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate address format
    if (!tokenAddress.trim()) {
      setError('Please enter a token address');
      return;
    }

    if (!ethers.isAddress(tokenAddress)) {
      setError('Invalid Ethereum address format');
      return;
    }

    setIsValidating(true);

    try {
      // Call the onAdd callback
      await onAdd(tokenAddress.trim());
      setTokenAddress('');
    } catch (err) {
      setError(err.message || 'Failed to add token');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="tokenAddress" className="block text-sm font-medium text-gray-700 mb-1">
            Token Contract Address
          </label>
          <input
            type="text"
            id="tokenAddress"
            value={tokenAddress}
            onChange={(e) => {
              setTokenAddress(e.target.value);
              setError('');
            }}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            disabled={isValidating}
          />
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={isValidating || !tokenAddress.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isValidating ? (
              <>
                <Spinner size={4} className="text-white" />
                Adding...
              </>
            ) : (
              'Add Token'
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isValidating}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Enter the contract address of an ERC-20 token to track its balance
        </p>
      </form>
    </div>
  );
}
