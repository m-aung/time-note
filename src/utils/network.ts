import * as Network from 'expo-network';
import { create } from 'zustand';

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  setNetworkState: (state: Partial<NetworkState>) => void;
}

export const useNetwork = create<NetworkState>((set) => ({
  isConnected: true,
  isInternetReachable: true,
  type: null,
  setNetworkState: (state) => set(state),
}));

// Check network status periodically
const checkNetworkStatus = async () => {
  try {
    const networkState = await Network.getNetworkStateAsync();
    useNetwork.getState().setNetworkState({
      isConnected: networkState.isConnected,
      isInternetReachable: networkState.isInternetReachable,
      type: networkState.type,
    });
  } catch (error) {
    console.error('Network status check error:', error);
  }
};

// Initial check
checkNetworkStatus();

// Check every 30 seconds
setInterval(checkNetworkStatus, 30000);

export const checkConnection = async () => {
  const networkState = await Network.getNetworkStateAsync();
  return networkState.isConnected && networkState.isInternetReachable;
}; 