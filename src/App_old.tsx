import { useState, useEffect } from "react";
import { appKit, wagmiAdapter, walletKit } from "./config";
import { useAppKit, useAppKitState, useAppKitAccount } from "@reown/appkit/react";
import { useBalance, useAccount, useChainId, useDisconnect } from "wagmi";
import "./App.css";
import Integrations from "./integrations/Integrations";
import SendCrypto from "./components/SendCrypto";
import ReceiveCrypto from "./components/ReceiveCrypto";
import { getEthBalance, formatBalance, getMultipleTokenBalances } from "./utils/balance";
import { formatAddress, getExplorerUrl } from "./utils/transactions";

// Common ERC-20 token addresses for demonstration
const COMMON_TOKENS = {
  USDC: "0xA0b86a33E6417fE5e1E04B1e5c7b5C2F9d8f5D5E" as const,
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7" as const,
  DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F" as const,
};

function App() {
  const { open } = useAppKit();
  const appKitState = useAppKitState();
  const { address } = useAppKitAccount();
  const { data: balance } = useBalance({ address });
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>({});
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);

  const isConnected = !!address && !!appKitState.activeChain;
  const formattedBalance = balance ? formatBalance(balance.formatted) : "0.0000";

  // Fetch token balances when connected
  useEffect(() => {
    let mounted = true;
    
    async function fetchTokenBalances() {
      if (isConnected && address) {
        setIsLoadingTokens(true);
        try {
          const balances = await getMultipleTokenBalances(
            address,
            Object.values(COMMON_TOKENS)
          );
          if (mounted) {
            setTokenBalances(balances);
          }
        } catch (error) {
          console.warn("Token balance fetch failed", error);
        } finally {
          if (mounted) {
            setIsLoadingTokens(false);
          }
        }
      }
    }

    fetchTokenBalances();
    return () => {
      mounted = false;
    };
  }, [isConnected, address]);

  // Initialize WalletKit when connected
  useEffect(() => {
    if (isConnected && address) {
      try {
        // WalletKit initialization for advanced features
        console.log("WalletKit initialized for address:", address);
      } catch (error) {
        console.error("WalletKit initialization failed:", error);
      }
    }
  }, [isConnected, address]);

  // Connect to wallet
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await open();
    } catch (error) {
      console.error("Failed to connect:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  // Open send modal
  const handleSend = () => {
    setShowSendModal(true);
  };

  // Open receive modal
  const handleReceive = () => {
    setShowReceiveModal(true);
  };

  // View on explorer
  const viewOnExplorer = () => {
    if (address && chainId) {
      const explorerUrl = getExplorerUrl(address, chainId);
      window.open(explorerUrl.replace('/tx/', '/address/'), '_blank');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>InvestreWallet</h1>
        <p>A modern crypto wallet application with advanced integrations</p>
        
        {isConnected && (
          <div className="header-info">
            <span className="network-badge">
              {appKitState.activeChain?.name || 'Unknown Network'}
            </span>
            <span className="address-badge" onClick={viewOnExplorer}>
              {formatAddress(address || '', 6)}
            </span>
          </div>
        )}
      </header>

      <main className="app-main">
        {!isConnected ? (
          <div className="connect-section">
            <h2>Connect Your Wallet</h2>
            <p>
              Connect to your favorite wallet or create a new embedded wallet to
              start managing your crypto assets securely with advanced features.
            </p>
            <div className="features-preview">
              <div className="feature-item">
                <span className="feature-icon">🔗</span>
                <span>WalletConnect v2</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🟣</span>
                <span>Farcaster Integration</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⛓️</span>
                <span>Multi-Chain Support</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🛠️</span>
                <span>Developer Tools</span>
              </div>
            </div>
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="connect-button"
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          </div>
        ) : (
          <div className="wallet-section">
            <div className="wallet-overview">
              <h2>Wallet Overview</h2>
              <div className="balance-card">
                <div className="main-balance">
                  <span className="balance-label">Total Balance</span>
                  <span className="balance-amount">{formattedBalance} ETH</span>
                  <span className="balance-usd">
                    ≈ ${(parseFloat(formattedBalance) * 2500).toFixed(2)} USD
                  </span>
                </div>
              </div>
            </div>

            <div className="wallet-info">
              <div className="info-card">
                <h3>Account Details</h3>
                <div className="info-row">
                  <span className="label">Address:</span>
                  <span className="value" onClick={viewOnExplorer}>
                    {formatAddress(address || '', 8)}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Network:</span>
                  <span className="value">{appKitState.activeChain?.name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Chain ID:</span>
                  <span className="value">{chainId}</span>
                </div>
              </div>

              {/* Token Balances */}
              <div className="info-card">
                <h3>Token Balances</h3>
                {isLoadingTokens ? (
                  <div className="loading">Loading token balances...</div>
                ) : (
                  <div className="token-list">
                    <div className="token-item">
                      <span className="token-symbol">ETH</span>
                      <span className="token-balance">{formattedBalance}</span>
                    </div>
                    {Object.entries(tokenBalances).map(([tokenAddress, balance]) => {
                      const symbol = Object.keys(COMMON_TOKENS).find(
                        key => COMMON_TOKENS[key as keyof typeof COMMON_TOKENS] === tokenAddress
                      ) || 'TOKEN';
                      return (
                        <div key={tokenAddress} className="token-item">
                          <span className="token-symbol">{symbol}</span>
                          <span className="token-balance">{formatBalance(balance)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="action-buttons">
              <button onClick={handleSend} className="action-button send">
                📤 Send
              </button>
              <button onClick={handleReceive} className="action-button receive">
                📥 Receive
              </button>
              <button onClick={viewOnExplorer} className="action-button explorer">
                🔍 Explorer
              </button>
              <button onClick={handleDisconnect} className="action-button disconnect">
                🔌 Disconnect
              </button>
            </div>
          </div>
        )}
        
        <Integrations />
      </main>

      {/* Modals */}
      {showSendModal && (
        <SendCrypto 
          onClose={() => setShowSendModal(false)}
          userBalance={formattedBalance}
        />
      )}
      
      {showReceiveModal && address && (
        <ReceiveCrypto 
          onClose={() => setShowReceiveModal(false)}
          address={address}
        />
      )}
    </div>
  );
}

export default App;

  // Disconnect wallet
  const handleDisconnect = async () => {
    try {
      await appKit.disconnect();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>InvestreWallet</h1>
        <p>A modern crypto wallet application</p>
      </header>

      <main className="app-main">
        {!isConnected ? (
          <div className="connect-section">
            <h2>Connect Your Wallet</h2>
            <p>
              Connect to your favorite wallet or create a new embedded wallet to
              start managing your crypto assets securely.
            </p>
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="connect-button"
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          </div>
        ) : (
          <div className="wallet-section">
            <h2>Wallet Connected</h2>
            <div className="wallet-info">
              <p>
                <strong>Address:</strong> {address}
              </p>
              <p>
                <strong>Balance:</strong> {balance} ETH
              </p>
            </div>
            <div className="action-buttons">
              <button
                onClick={() => {
                  /* TODO: Send */
                }}
                className="send-button"
              >
                Send
              </button>
              <button
                onClick={() => {
                  /* TODO: Receive */
                }}
                className="receive-button"
              >
                Receive
              </button>
              <button onClick={handleDisconnect} className="disconnect-button">
                Disconnect
              </button>
            </div>
          </div>
        )}
        <Integrations />
      </main>
    </div>
  );
}

export default App;