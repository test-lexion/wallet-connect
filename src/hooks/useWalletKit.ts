import { walletKit } from "../config";
import { useState, useCallback } from "react";

export interface WalletKitFeatures {
  // Session management
  activeSessions: any[];
  
  // Request handling
  sendRequest: (params: {
    chainId: string;
    method: string;
    params: any[];
  }) => Promise<any>;
  
  // Advanced signing
  signTypedData: (data: any) => Promise<string>;
  personalSign: (message: string) => Promise<string>;
  
  // Chain switching
  switchChain: (chainId: number) => Promise<void>;
  addChain: (chainConfig: any) => Promise<void>;
  
  // Token operations
  addToken: (tokenConfig: any) => Promise<void>;
  watchAsset: (assetConfig: any) => Promise<boolean>;
  
  // State
  isLoading: boolean;
  error: string | null;
}

/**
 * Advanced WalletKit hook for enhanced wallet management
 */
export function useWalletKit(): WalletKitFeatures {
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Send generic JSON-RPC request
  const sendRequest = useCallback(async (params: {
    chainId: string;
    method: string;
    params: any[];
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Using WalletKit for advanced request handling
      const result = await walletKit.request({
        chainId: params.chainId,
        request: {
          method: params.method,
          params: params.params,
        },
      });
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Request failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign typed data (EIP-712)
  const signTypedData = useCallback(async (data: any): Promise<string> => {
    try {
      const result = await sendRequest({
        chainId: "eip155:1",
        method: "eth_signTypedData_v4",
        params: [data.account, JSON.stringify(data.typedData)],
      });
      
      return result as string;
    } catch (err) {
      throw new Error(`Typed data signing failed: ${err}`);
    }
  }, [sendRequest]);

  // Personal sign
  const personalSign = useCallback(async (message: string): Promise<string> => {
    try {
      const result = await sendRequest({
        chainId: "eip155:1", 
        method: "personal_sign",
        params: [message, walletKit.getAddress()],
      });
      
      return result as string;
    } catch (err) {
      throw new Error(`Personal sign failed: ${err}`);
    }
  }, [sendRequest]);

  // Switch chain
  const switchChain = useCallback(async (chainId: number): Promise<void> => {
    try {
      await sendRequest({
        chainId: "eip155:1",
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (err) {
      throw new Error(`Chain switch failed: ${err}`);
    }
  }, [sendRequest]);

  // Add chain
  const addChain = useCallback(async (chainConfig: {
    chainId: string;
    chainName: string;
    rpcUrls: string[];
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    blockExplorerUrls?: string[];
  }): Promise<void> => {
    try {
      await sendRequest({
        chainId: "eip155:1",
        method: "wallet_addEthereumChain",
        params: [chainConfig],
      });
    } catch (err) {
      throw new Error(`Add chain failed: ${err}`);
    }
  }, [sendRequest]);

  // Add token to wallet
  const addToken = useCallback(async (tokenConfig: {
    type: string;
    options: {
      address: string;
      symbol: string;
      decimals: number;
      image?: string;
    };
  }): Promise<void> => {
    try {
      await sendRequest({
        chainId: "eip155:1",
        method: "wallet_watchAsset",
        params: [tokenConfig],
      });
    } catch (err) {
      throw new Error(`Add token failed: ${err}`);
    }
  }, [sendRequest]);

  // Watch asset (more advanced token watching)
  const watchAsset = useCallback(async (assetConfig: {
    type: string;
    options: {
      address: string;
      symbol: string;
      decimals: number;
      image?: string;
    };
  }): Promise<boolean> => {
    try {
      const result = await sendRequest({
        chainId: "eip155:1",
        method: "wallet_watchAsset",
        params: [assetConfig],
      });
      
      return result as boolean;
    } catch (err) {
      console.error("Watch asset failed:", err);
      return false;
    }
  }, [sendRequest]);

  return {
    activeSessions,
    sendRequest,
    signTypedData,
    personalSign,
    switchChain,
    addChain,
    addToken,
    watchAsset,
    isLoading,
    error,
  };
}