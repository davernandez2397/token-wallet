import { create } from 'zustand';

const useWalletStore = create((set) => ({
  // State
  address: null,
  provider: null,
  signer: null,
  chainId: null,
  isConnected: false,
  isConnecting: false,
  error: null,

  // Actions
  setWallet: (walletData) => set({
    address: walletData.address,
    provider: walletData.provider,
    signer: walletData.signer,
    chainId: walletData.chainId,
    isConnected: true,
    isConnecting: false,
    error: null
  }),

  setChainId: (chainId) => set({ chainId }),

  setConnecting: (isConnecting) => set({ isConnecting }),

  setError: (error) => set({ error, isConnecting: false }),

  disconnect: () => set({
    address: null,
    provider: null,
    signer: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    error: null
  }),

  clearError: () => set({ error: null })
}));

export default useWalletStore;
