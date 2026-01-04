import { useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import useWalletStore from '../store/walletStore';
import { getNetworkByChainId } from '../config/networks';

export function useWallet() {
  const {
    address,
    chainId,
    isConnected,
    isConnecting,
    error,
    setWallet,
    setChainId,
    setConnecting,
    setError,
    disconnect,
    clearError
  } = useWalletStore();

  // Connect to MetaMask
  const connect = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed. Please install MetaMask to use this app.');
      return;
    }

    try {
      setConnecting(true);
      clearError();

      // Request account access
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      // Get signer and address
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      // Get chain ID
      const network = await provider.getNetwork();
      const walletChainId = Number(network.chainId);

      setWallet({
        address: walletAddress,
        provider,
        signer,
        chainId: walletChainId
      });
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError(err.message || 'Failed to connect wallet');
    }
  }, [setConnecting, clearError, setWallet, setError]);

  // Switch network
  const switchNetwork = useCallback(async (targetChainId) => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (err) {
      // This error code indicates that the chain has not been added to MetaMask
      if (err.code === 4902) {
        setError('Please add this network to MetaMask first');
      } else {
        setError(err.message || 'Failed to switch network');
      }
    }
  }, [setError]);

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum === 'undefined') return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== address) {
        // Reconnect with new account
        connect();
      }
    };

    const handleChainChanged = () => {
      // Reload to ensure proper state with new chain
      window.location.reload();
    };

    const handleDisconnect = () => {
      disconnect();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [address, connect, disconnect]);

  // Auto-reconnect on page load if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (typeof window.ethereum === 'undefined') return;

      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await connect();
        }
      } catch (err) {
        console.error('Auto-connect failed:', err);
      }
    };

    autoConnect();
  }, [connect]);

  const currentNetwork = getNetworkByChainId(chainId);

  return {
    address,
    chainId,
    network: currentNetwork,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    switchNetwork,
    clearError
  };
}
