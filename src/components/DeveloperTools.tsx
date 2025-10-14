import React, { useState } from "react";
import { useWalletConnect } from "../hooks/useWalletConnect";
import { useWalletKit } from "../hooks/useWalletKit";
import { useAppKitAccount } from "@reown/appkit/react";

const DeveloperTools: React.FC = () => {
  const walletConnect = useWalletConnect();
  const walletKit = useWalletKit();
  const { address } = useAppKitAccount();
  
  const [customMessage, setCustomMessage] = useState("Hello from InvestreWallet!");
  const [customChainId, setCustomChainId] = useState(137); // Polygon
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  const executeAction = async (action: string, params?: any) => {
    setIsLoading(true);
    setSelectedTool(action);
    
    try {
      let result: any = null;
      
      switch (action) {
        case "personal_sign":
          if (walletConnect.isConnected) {
            result = await walletConnect.signMessage(customMessage);
          } else {
            result = await walletKit.personalSign(customMessage);
          }
          break;
          
        case "sign_typed_data":
          const typedData = {
            domain: {
              name: "InvestreWallet",
              version: "1",
              chainId: 1,
              verifyingContract: "0x1234567890123456789012345678901234567890"
            },
            types: {
              Message: [
                { name: "content", type: "string" },
                { name: "timestamp", type: "uint256" }
              ]
            },
            primaryType: "Message",
            message: {
              content: customMessage,
              timestamp: Math.floor(Date.now() / 1000)
            }
          };
          
          result = await walletKit.signTypedData({
            account: address,
            typedData
          });
          break;
          
        case "switch_chain":
          result = await walletKit.switchChain(customChainId);
          break;
          
        case "add_polygon":
          result = await walletKit.addChain({
            chainId: "0x89",
            chainName: "Polygon Mainnet",
            rpcUrls: ["https://polygon-rpc.com/"],
            nativeCurrency: {
              name: "MATIC",
              symbol: "MATIC",
              decimals: 18
            },
            blockExplorerUrls: ["https://polygonscan.com/"]
          });
          break;
          
        case "add_usdc_token":
          result = await walletKit.addToken({
            type: "ERC20",
            options: {
              address: "0xA0b86a33E6417fE5e1E04B1e5c7b5C2F9d8f5D5E",
              symbol: "USDC",
              decimals: 6,
              image: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png"
            }
          });
          break;
          
        case "gas_estimation":
          result = await walletKit.sendRequest({
            chainId: "eip155:1",
            method: "eth_estimateGas",
            params: [{
              to: "0x1234567890123456789012345678901234567890",
              value: "0x1",
              data: "0x"
            }]
          });
          break;
          
        case "get_balance":
          result = await walletKit.sendRequest({
            chainId: "eip155:1",
            method: "eth_getBalance",
            params: [address, "latest"]
          });
          break;
          
        case "get_transaction_count":
          result = await walletKit.sendRequest({
            chainId: "eip155:1",
            method: "eth_getTransactionCount",
            params: [address, "latest"]
          });
          break;
          
        case "raw_transaction":
          result = await walletKit.sendRequest({
            chainId: "eip155:1",
            method: "eth_sendTransaction",
            params: [{
              from: address,
              to: "0x1234567890123456789012345678901234567890",
              value: "0x1",
              gas: "0x5208"
            }]
          });
          break;
          
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      
      setResults(prev => ({
        ...prev,
        [action]: {
          success: true,
          data: result,
          timestamp: new Date().toISOString()
        }
      }));
      
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [action]: {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setIsLoading(false);
      setSelectedTool(null);
    }
  };

  const clearResults = () => {
    setResults({});
  };

  const tools = [
    {
      id: "personal_sign",
      name: "Personal Sign",
      description: "Sign a custom message",
      category: "Signing"
    },
    {
      id: "sign_typed_data",
      name: "Sign Typed Data",
      description: "Sign structured data (EIP-712)",
      category: "Signing"
    },
    {
      id: "switch_chain",
      name: "Switch Chain",
      description: "Switch to different network",
      category: "Network"
    },
    {
      id: "add_polygon",
      name: "Add Polygon",
      description: "Add Polygon network",
      category: "Network"
    },
    {
      id: "add_usdc_token",
      name: "Add USDC Token",
      description: "Add USDC to wallet",
      category: "Tokens"
    },
    {
      id: "gas_estimation",
      name: "Gas Estimation",
      description: "Estimate transaction gas",
      category: "Transactions"
    },
    {
      id: "get_balance",
      name: "Get Balance",
      description: "Get account balance",
      category: "Queries"
    },
    {
      id: "get_transaction_count",
      name: "Get Nonce",
      description: "Get transaction count",
      category: "Queries"
    },
    {
      id: "raw_transaction",
      name: "Raw Transaction",
      description: "Send raw transaction",
      category: "Transactions"
    }
  ];

  const categories = [...new Set(tools.map(tool => tool.category))];

  return (
    <div className="developer-tools">
      <div className="tools-header">
        <h3>🛠️ Advanced Developer Tools</h3>
        <p>Test wallet functionality and blockchain interactions</p>
      </div>

      <div className="tools-config">
        <div className="config-row">
          <label>Custom Message:</label>
          <input
            type="text"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="config-input"
            placeholder="Enter message to sign"
          />
        </div>
        
        <div className="config-row">
          <label>Chain ID:</label>
          <select
            value={customChainId}
            onChange={(e) => setCustomChainId(Number(e.target.value))}
            className="config-select"
          >
            <option value={1}>Ethereum (1)</option>
            <option value={137}>Polygon (137)</option>
            <option value={8453}>Base (8453)</option>
            <option value={42161}>Arbitrum (42161)</option>
            <option value={10}>Optimism (10)</option>
          </select>
        </div>
      </div>

      <div className="tools-grid">
        {categories.map(category => (
          <div key={category} className="tool-category">
            <h4>{category}</h4>
            <div className="category-tools">
              {tools
                .filter(tool => tool.category === category)
                .map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => executeAction(tool.id)}
                    disabled={isLoading || (!address && !walletConnect.isConnected)}
                    className={`tool-item ${selectedTool === tool.id ? 'loading' : ''}`}
                    title={tool.description}
                  >
                    <div className="tool-name">{tool.name}</div>
                    <div className="tool-desc">{tool.description}</div>
                    {selectedTool === tool.id && (
                      <div className="tool-loading">⏳</div>
                    )}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="tools-status">
        <div className="status-header">
          <h4>Connection Status</h4>
          <button onClick={clearResults} className="clear-button">
            Clear Results
          </button>
        </div>
        
        <div className="status-items">
          <div className={`status-item ${address ? 'connected' : 'disconnected'}`}>
            <span>AppKit:</span>
            <span>{address ? `✅ ${address.slice(0, 8)}...` : "❌ Not connected"}</span>
          </div>
          
          <div className={`status-item ${walletConnect.isConnected ? 'connected' : 'disconnected'}`}>
            <span>WalletConnect:</span>
            <span>{walletConnect.isConnected ? `✅ ${walletConnect.address.slice(0, 8)}...` : "❌ Not connected"}</span>
          </div>
          
          <div className={`status-item ${!walletKit.error ? 'connected' : 'disconnected'}`}>
            <span>WalletKit:</span>
            <span>{!walletKit.error ? "✅ Ready" : "❌ Error"}</span>
          </div>
        </div>
      </div>

      {Object.keys(results).length > 0 && (
        <div className="tools-results">
          <h4>Results</h4>
          <div className="results-list">
            {Object.entries(results).map(([action, result]) => (
              <div key={action} className={`result-item ${result.success ? 'success' : 'error'}`}>
                <div className="result-header">
                  <span className="result-action">{action}</span>
                  <span className="result-time">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="result-content">
                  {result.success ? (
                    <pre>{JSON.stringify(result.data, null, 2)}</pre>
                  ) : (
                    <div className="error-content">{result.error}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperTools;