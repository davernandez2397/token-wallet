import { useWallet } from '../../hooks/useWallet';
import { formatAddress } from '../../config/networks';
import Spinner from '../ui/Spinner';

export default function WalletConnect() {
  const { address, network, isConnected, isConnecting, error, connect, disconnect, clearError } = useWallet();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="ml-3 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <button
        onClick={connect}
        disabled={isConnecting}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
      >
        {isConnecting ? (
          <>
            <Spinner size={5} className="text-white" />
            Connecting...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Connect Wallet
          </>
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Network Badge */}
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
        <div className={`w-2 h-2 rounded-full ${network?.chainId === 11155111 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
        <span className="text-sm font-medium text-gray-700">
          {network?.name || 'Unknown Network'}
        </span>
      </div>

      {/* Address Badge */}
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="text-sm font-medium text-gray-700 font-mono">
          {formatAddress(address)}
        </span>
      </div>

      {/* Disconnect Button */}
      <button
        onClick={disconnect}
        className="text-gray-500 hover:text-red-600 transition-colors duration-200 p-2"
        title="Disconnect"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  );
}
