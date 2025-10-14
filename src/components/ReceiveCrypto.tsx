import React, { useState, useEffect } from "react";
import { formatAddress } from "../utils/transactions";
import { useAppKit } from "@reown/appkit/react";

interface ReceiveCryptoProps {
  onClose: () => void;
  address: string;
}

const ReceiveCrypto: React.FC<ReceiveCryptoProps> = ({ onClose, address }) => {
  const [copied, setCopied] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const { appKit } = useAppKit();

  useEffect(() => {
    // Generate QR code URL (using a QR service)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${address}`;
    setQrCode(qrUrl);
  }, [address]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = address;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareAddress = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Crypto Wallet Address",
          text: `Send crypto to my wallet: ${address}`,
          url: `ethereum:${address}`,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      copyToClipboard();
    }
  };

  const openInWallet = () => {
    const walletUrl = `ethereum:${address}`;
    window.open(walletUrl, "_blank");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Receive Crypto</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="receive-content">
          <div className="qr-section">
            <div className="qr-container">
              {qrCode ? (
                <img src={qrCode} alt="QR Code" className="qr-code" />
              ) : (
                <div className="qr-placeholder">Loading QR Code...</div>
              )}
            </div>
            <p className="qr-instruction">
              Scan this QR code with any crypto wallet to send funds to your address
            </p>
          </div>

          <div className="address-section">
            <h3>Your Wallet Address</h3>
            <div className="address-container">
              <div className="address-display">
                <span className="address-text">{address}</span>
                <span className="address-short">{formatAddress(address, 8)}</span>
              </div>
              <button
                onClick={copyToClipboard}
                className={`copy-button ${copied ? "copied" : ""}`}
                title="Copy address"
              >
                {copied ? "✓" : "📋"}
              </button>
            </div>
            {copied && (
              <div className="copy-feedback">
                Address copied to clipboard!
              </div>
            )}
          </div>

          <div className="network-info">
            <h4>Supported Networks</h4>
            <div className="networks-grid">
              <div className="network-item">
                <span className="network-icon">🟢</span>
                <span>Ethereum Mainnet</span>
              </div>
              <div className="network-item">
                <span className="network-icon">🟣</span>
                <span>Polygon</span>
              </div>
              <div className="network-item">
                <span className="network-icon">🔵</span>
                <span>Base</span>
              </div>
              <div className="network-item">
                <span className="network-icon">🔴</span>
                <span>Arbitrum</span>
              </div>
              <div className="network-item">
                <span className="network-icon">🔴</span>
                <span>Optimism</span>
              </div>
            </div>
          </div>

          <div className="security-notice">
            <h4>⚠️ Security Notice</h4>
            <ul>
              <li>Only send crypto from trusted sources</li>
              <li>Double-check the sender's address</li>
              <li>Small test transactions are recommended first</li>
              <li>This address works on all EVM-compatible networks</li>
            </ul>
          </div>

          <div className="quick-actions">
            <button onClick={shareAddress} className="action-button share">
              📱 Share Address
            </button>
            <button onClick={openInWallet} className="action-button wallet">
              👛 Open in Wallet
            </button>
            <button onClick={copyToClipboard} className="action-button copy">
              📋 Copy Again
            </button>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="close-modal-button">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiveCrypto;