import React, { useState, useEffect } from "react";
import { WalletConnectService } from "../utils/walletconnect";
import { projectId } from "../config";
import { useAppKitState } from "@reown/appkit/react";

const Integrations: React.FC = () => {
  const [wcService] = useState(() => new WalletConnectService(projectId));
  const [wcConnected, setWcConnected] = useState(false);
  const [wcAddress, setWcAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [farcasterData, setFarcasterData] = useState<any>(null);
  
  const appKitState = useAppKitState();

  useEffect(() => {
    // Set up WalletConnect event listeners
    wcService.setupEventListeners({
      onSessionUpdate: (session) => {
        setWcConnected(true);
        setWcAddress(wcService.getAddress());
      },
      onSessionDelete: () => {
        setWcConnected(false);
        setWcAddress("");
      },
    });

    // Check if already connected
    if (wcService.isConnected()) {
      setWcConnected(true);
      setWcAddress(wcService.getAddress());
    }
  }, [wcService]);

  const handleWCConnect = async () => {
    setIsConnecting(true);
    try {
      await wcService.connect();
      setWcConnected(true);
      setWcAddress(wcService.getAddress());
    } catch (error) {
      console.error("WalletConnect connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleWCDisconnect = async () => {
    try {
      await wcService.disconnect();
      setWcConnected(false);
      setWcAddress("");
    } catch (error) {
      console.error("WalletConnect disconnect failed:", error);
    }
  };

  const handleSignMessage = async () => {
    if (!wcConnected) return;
    
    try {
      const message = "Hello from InvestreWallet!";
      const signature = await wcService.signMessage(message);
      alert(`Message signed: ${signature}`);
    } catch (error) {
      console.error("Message signing failed:", error);
      alert("Failed to sign message");
    }
  };

  // Farcaster Miniapp SDK integration
  const initializeFarcaster = async () => {
    try {
      // Note: This would require proper Farcaster SDK setup
      // For now, we'll show a placeholder
      setFarcasterData({
        user: "demo_user",
        frames: ["frame1", "frame2"],
        isInFarcaster: false,
      });
    } catch (error) {
      console.error("Farcaster initialization failed:", error);
    }
  };

  useEffect(() => {
    initializeFarcaster();
  }, []);

  return (
    <div className="integrations-section">
      <h2>Advanced Integrations</h2>
      
      {/* WalletConnect Integration */}
      <div className="integration-card">
        <h3>🔗 WalletConnect v2</h3>
        <p>Direct WalletConnect integration for enhanced wallet connections</p>
        
        {!wcConnected ? (
          <button
            onClick={handleWCConnect}
            disabled={isConnecting}
            className="integration-button"
          >
            {isConnecting ? "Connecting..." : "Connect via WalletConnect"}
          </button>
        ) : (
          <div className="wc-connected">
            <p><strong>Connected:</strong> {wcAddress}</p>
            <div className="wc-actions">
              <button onClick={handleSignMessage} className="sign-button">
                Sign Message
              </button>
              <button onClick={handleWCDisconnect} className="disconnect-button">
                Disconnect WC
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Farcaster Integration */}
      <div className="integration-card">
        <h3>🟣 Farcaster Miniapp</h3>
        <p>Social crypto features with Farcaster protocol</p>
        
        {farcasterData ? (
          <div className="farcaster-info">
            <p><strong>Status:</strong> {farcasterData.isInFarcaster ? "In Farcaster" : "Standalone"}</p>
            <p><strong>User:</strong> {farcasterData.user}</p>
            <p><strong>Available Frames:</strong> {farcasterData.frames.length}</p>
            <button className="integration-button" disabled>
              Farcaster Features (Demo)
            </button>
          </div>
        ) : (
          <div className="loading">Loading Farcaster data...</div>
        )}
      </div>

      {/* Chain Information */}
      <div className="integration-card">
        <h3>⛓️ Network Information</h3>
        <p>Current blockchain network details</p>
        
        <div className="network-info">
          <p><strong>Active Chain:</strong> {appKitState.activeChain?.name || "None"}</p>
          <p><strong>Chain ID:</strong> {appKitState.activeChain?.id || "N/A"}</p>
          <p><strong>Native Currency:</strong> {appKitState.activeChain?.nativeCurrency?.symbol || "N/A"}</p>
          
          {appKitState.activeChain && (
            <div className="chain-actions">
              <button className="integration-button">
                View on Explorer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Tools */}
      <div className="integration-card">
        <h3>🛠️ Developer Tools</h3>
        <p>Advanced transaction and debugging features</p>
        
        <div className="dev-tools">
          <button className="tool-button">
            Raw Transaction
          </button>
          <button className="tool-button">
            Sign Typed Data
          </button>
          <button className="tool-button">
            Contract Interaction
          </button>
          <button className="tool-button">
            Gas Estimation
          </button>
        </div>
      </div>

      {/* Integration Status */}
      <div className="integration-status">
        <h4>Integration Status</h4>
        <div className="status-grid">
          <div className={`status-item ${appKitState.activeChain ? 'active' : 'inactive'}`}>
            <span>AppKit:</span>
            <span>{appKitState.activeChain ? "✅ Connected" : "❌ Disconnected"}</span>
          </div>
          <div className={`status-item ${wcConnected ? 'active' : 'inactive'}`}>
            <span>WalletConnect:</span>
            <span>{wcConnected ? "✅ Connected" : "❌ Disconnected"}</span>
          </div>
          <div className={`status-item ${farcasterData ? 'active' : 'inactive'}`}>
            <span>Farcaster:</span>
            <span>{farcasterData ? "✅ Initialized" : "❌ Not loaded"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;