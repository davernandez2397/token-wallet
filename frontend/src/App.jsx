import WalletConnect from './components/wallet/WalletConnect';
import BalanceCard from './components/balance/BalanceCard';
import TokenBalance from './components/balance/TokenBalance';
import SendForm from './components/transaction/SendForm';
import TransactionList from './components/history/TransactionList';
import { useWallet } from './hooks/useWallet';

function App() {
  const { isConnected, address, network } = useWallet();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Token Wallet</h1>
                <p className="text-sm text-gray-500">Ethereum Web Interface</p>
              </div>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Connect your MetaMask wallet to view balances, send transactions, and interact with the Ethereum blockchain.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="font-semibold text-blue-900 mb-2">Don't have MetaMask?</h3>
              <p className="text-sm text-blue-700 mb-4">
                MetaMask is a crypto wallet & gateway to blockchain apps.
              </p>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                Install MetaMask
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        ) : (
          <div>
            {/* Connected State */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Wallet Info Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Wallet Address</p>
                      <p className="font-mono text-sm font-medium text-gray-900">
                        {address?.slice(0, 10)}...{address?.slice(-8)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Network Info Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      network?.chainId === 11155111 ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      <div className={`w-6 h-6 rounded-full ${
                        network?.chainId === 11155111 ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Network</p>
                      <p className="font-medium text-gray-900">{network?.name || 'Unknown'}</p>
                    </div>
                  </div>
                </div>

                {/* Status Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium text-green-600">Connected</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Balances Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <BalanceCard />
              <TokenBalance />
            </div>

            {/* Send Transaction Section */}
            <div className="mb-8">
              <SendForm />
            </div>

            {/* Transaction History Section */}
            <div className="mb-8">
              <TransactionList />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
