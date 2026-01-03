import { useState } from 'react';
import { ethers } from 'ethers';
import { useTransaction } from '../../hooks/useTransaction';
import { useWallet } from '../../hooks/useWallet';
import { getNetworkByChainId } from '../../config/networks';

export default function SendForm() {
  const { chainId, network } = useWallet();
  const {
    estimateEth,
    estimateToken,
    sendEth,
    sendToken,
    isEstimatingEth,
    isEstimatingToken,
    isSendingEth,
    isSendingToken,
    ethEstimate,
    tokenEstimate,
    ethEstimateError,
    tokenEstimateError,
    sendEthError,
    sendTokenError,
    txHash,
    txStatus,
    resetTx
  } = useTransaction();

  const [transferType, setTransferType] = useState('eth'); // 'eth' or 'token'
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [tokenAddress, setTokenAddress] = useState('0x3f17EB051a65e6AED34DfaC2D02bdD105c25D57d'); // Default MTT token
  const [showConfirm, setShowConfirm] = useState(false);
  const [estimate, setEstimate] = useState(null);

  const isEstimating = isEstimatingEth || isEstimatingToken;
  const isSending = isSendingEth || isSendingToken;
  const currentError = ethEstimateError || tokenEstimateError || sendEthError || sendTokenError;

  const handleEstimate = async () => {
    try {
      setEstimate(null);

      if (transferType === 'eth') {
        const est = await estimateEth({ toAddress, amount });
        setEstimate(est);
      } else {
        const est = await estimateToken({ toAddress, amount, tokenAddress });
        setEstimate(est);
      }

      setShowConfirm(true);
    } catch (error) {
      console.error('Estimation failed:', error);
    }
  };

  const handleSend = async () => {
    try {
      if (transferType === 'eth') {
        await sendEth({ toAddress, amount });
      } else {
        await sendToken({ toAddress, amount, tokenAddress });
      }

      // Reset form after successful send
      setToAddress('');
      setAmount('');
      setShowConfirm(false);
      setEstimate(null);
    } catch (error) {
      console.error('Send failed:', error);
    }
  };

  const handleReset = () => {
    setToAddress('');
    setAmount('');
    setTokenAddress('0x3f17EB051a65e6AED34DfaC2D02bdD105c25D57d');
    setShowConfirm(false);
    setEstimate(null);
    resetTx();
  };

  const isValidForm = () => {
    if (!toAddress || !amount) return false;
    if (!ethers.isAddress(toAddress)) return false;
    if (transferType === 'token' && !ethers.isAddress(tokenAddress)) return false;
    try {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) return false;
    } catch {
      return false;
    }
    return true;
  };

  // Show transaction status
  if (txStatus === 'pending' || txStatus === 'confirmed') {
    const networkInfo = getNetworkByChainId(chainId);
    const explorerUrl = networkInfo?.explorerUrl || 'https://sepolia.etherscan.io';

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Status</h3>

        {txStatus === 'pending' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-2">Transaction Pending</p>
            <p className="text-sm text-gray-600 mb-4">Waiting for blockchain confirmation...</p>
            {txHash && (
              <a
                href={`${explorerUrl}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 font-mono"
              >
                {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </a>
            )}
          </div>
        )}

        {txStatus === 'confirmed' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-green-600 mb-2">Transaction Confirmed!</p>
            <p className="text-sm text-gray-600 mb-4">Your transaction has been successfully processed</p>
            {txHash && (
              <a
                href={`${explorerUrl}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-mono mb-4"
              >
                {txHash.slice(0, 10)}...{txHash.slice(-8)}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
            <div className="mt-6">
              <button
                onClick={handleReset}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Send Another Transaction
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Transaction</h3>

      {/* Transfer Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Transfer Type</label>
        <div className="flex gap-3">
          <button
            onClick={() => setTransferType('eth')}
            disabled={isSending || showConfirm}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
              transferType === 'eth'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            } disabled:opacity-50`}
          >
            <div className="font-semibold">ETH</div>
            <div className="text-xs text-gray-500">Native Currency</div>
          </button>
          <button
            onClick={() => setTransferType('token')}
            disabled={isSending || showConfirm}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
              transferType === 'token'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            } disabled:opacity-50`}
          >
            <div className="font-semibold">Token</div>
            <div className="text-xs text-gray-500">ERC-20</div>
          </button>
        </div>
      </div>

      {/* Token Address (only for token transfers) */}
      {transferType === 'token' && (
        <div className="mb-4">
          <label htmlFor="tokenAddress" className="block text-sm font-medium text-gray-700 mb-1">
            Token Contract Address
          </label>
          <input
            type="text"
            id="tokenAddress"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            disabled={isSending || showConfirm}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm disabled:bg-gray-100"
          />
        </div>
      )}

      {/* Recipient Address */}
      <div className="mb-4">
        <label htmlFor="toAddress" className="block text-sm font-medium text-gray-700 mb-1">
          Recipient Address
        </label>
        <input
          type="text"
          id="toAddress"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          disabled={isSending || showConfirm}
          placeholder="0x..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm disabled:bg-gray-100"
        />
      </div>

      {/* Amount */}
      <div className="mb-4">
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          Amount
        </label>
        <input
          type="text"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isSending || showConfirm}
          placeholder="0.0"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        />
      </div>

      {/* Error Display */}
      {currentError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{currentError.message}</p>
        </div>
      )}

      {/* Gas Estimate Display */}
      {estimate && showConfirm && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Transaction Details</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Gas:</span>
              <span className="font-mono text-gray-900">{estimate.gasEstimate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gas Price:</span>
              <span className="font-mono text-gray-900">{estimate.gasPrice} Gwei</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gas Cost:</span>
              <span className="font-mono text-gray-900">~{estimate.gasCost} {estimate.currency}</span>
            </div>
            {transferType === 'eth' && (
              <div className="flex justify-between pt-2 border-t border-blue-300">
                <span className="font-semibold text-gray-700">Total Cost:</span>
                <span className="font-mono font-semibold text-gray-900">~{estimate.totalCost} {estimate.currency}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!showConfirm ? (
          <button
            onClick={handleEstimate}
            disabled={!isValidForm() || isEstimating || isSending}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isEstimating ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Estimating...
              </>
            ) : (
              'Preview Transaction'
            )}
          </button>
        ) : (
          <>
            <button
              onClick={() => {
                setShowConfirm(false);
                setEstimate(null);
              }}
              disabled={isSending}
              className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={isSending}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSending ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                'Confirm & Send'
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
