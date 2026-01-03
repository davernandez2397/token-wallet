import { useEthBalance } from '../../hooks/useBalance';
import { formatTokenAmount } from '../../config/networks';

export default function BalanceCard() {
  const { data: balance, isLoading, isError, error } = useEthBalance();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-600 text-sm">
          Error loading balance: {error?.message}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">ETH Balance</p>
          <p className="text-3xl font-bold text-gray-900">
            {balance ? formatTokenAmount(balance.balanceFormatted) : '0'}{' '}
            <span className="text-xl text-gray-500">{balance?.currency || 'ETH'}</span>
          </p>
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center">
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 784.37 1277.39">
            <path d="M392.07,0l-8.57,29.11V844.63l8.57,8.55,392.06-231.75Z" />
            <path d="M392.07,0L0,621.43l392.07,231.75V472.33Z" opacity="0.6" />
            <path d="M392.07,956.52l-4.83,5.89V1263.3l4.83,14.09,392.3-552.49Z" />
            <path d="M392.07,1277.39V956.52L0,724.89Z" opacity="0.6" />
            <path d="M392.07,853.18l392.06-231.75L392.07,472.33Z" opacity="0.2" />
            <path d="M0,621.43l392.07,231.75V472.33Z" opacity="0.6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
