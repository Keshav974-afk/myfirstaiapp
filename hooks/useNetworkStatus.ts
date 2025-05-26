import { useState, createContext, useContext, createElement } from 'react';

interface NetworkStatusContextType {
  isConnected: boolean;
  setIsConnected: (status: boolean) => void;
}

const NetworkStatusContext = createContext<NetworkStatusContextType>({
  isConnected: true,
  setIsConnected: () => {},
});

export function NetworkStatusProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(true);

  return createElement(NetworkStatusContext.Provider, {
    value: { isConnected, setIsConnected },
    children,
  });
}

export const useNetworkStatus = () => useContext(NetworkStatusContext);