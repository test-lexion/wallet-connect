import { WalletConnectService } from "../utils/walletconnect";
import { projectId } from "../config";
import { useState, useEffect } from "react";

export interface WalletConnectHookReturn {
  service: WalletConnectService;
  isConnected: boolean;
  address: string;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  sendTransaction: (params: { to: string; value: string; data?: string }) => Promise<string>;
}

/**
 * Custom hook for WalletConnect v2 integration
 */
export function useWalletConnect(): WalletConnectHookReturn {
  const [service] = useState(() => new WalletConnectService(projectId));
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up event listeners
    service.setupEventListeners({
      onSessionUpdate: (session) => {
        setIsConnected(true);
        setAddress(service.getAddress());
        setError(null);
      },
      onSessionDelete: () => {
        setIsConnected(false);
        setAddress("");
        setError(null);
      },
    });

    // Check if already connected
    if (service.isConnected()) {
      setIsConnected(true);
      setAddress(service.getAddress());
    }

    return () => {
      // Cleanup if needed
    };
  }, [service]);

  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      await service.connect();
      setIsConnected(true);
      setAddress(service.getAddress());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
      console.error("WalletConnect connection failed:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      await service.disconnect();
      setIsConnected(false);
      setAddress("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Disconnect failed");
      console.error("WalletConnect disconnect failed:", err);
    }
  };

  const signMessage = async (message: string): Promise<string> => {
    try {
      setError(null);
      const signature = await service.signMessage(message);
      return signature;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Signing failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const sendTransaction = async (params: { 
    to: string; 
    value: string; 
    data?: string 
  }): Promise<string> => {
    try {
      setError(null);
      const txHash = await service.sendTransaction(params);
      return txHash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Transaction failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    service,
    isConnected,
    address,
    isConnecting,
    error,
    connect,
    disconnect,
    signMessage,
    sendTransaction,
  };
}