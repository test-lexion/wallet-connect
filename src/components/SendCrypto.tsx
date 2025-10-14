import React, { useState } from "react";
import { sendEthTransaction, isValidAddress, isValidAmount } from "../utils/transactions";
import { formatAddress } from "../utils/transactions";

interface SendCryptoProps {
  onClose: () => void;
  userBalance: string;
}

const SendCrypto: React.FC<SendCryptoProps> = ({ onClose, userBalance }) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSend = async () => {
    setError("");
    setSuccess("");

    // Validation
    if (!isValidAddress(recipient)) {
      setError("Invalid recipient address");
      return;
    }

    if (!isValidAmount(amount)) {
      setError("Invalid amount");
      return;
    }

    const balanceNum = parseFloat(userBalance);
    const amountNum = parseFloat(amount);

    if (amountNum > balanceNum) {
      setError("Insufficient balance");
      return;
    }

    if (amountNum <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    setIsLoading(true);

    try {
      const result = await sendEthTransaction({
        to: recipient as `0x${string}`,
        value: amount,
      });

      if (result.success) {
        setSuccess(`Transaction sent! Hash: ${result.hash}`);
        setRecipient("");
        setAmount("");
      } else {
        setError(result.error || "Transaction failed");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaxAmount = () => {
    const maxAmount = Math.max(0, parseFloat(userBalance) - 0.001); // Reserve for gas
    setAmount(maxAmount.toString());
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Send ETH</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="send-form">
          <div className="form-group">
            <label htmlFor="recipient">Recipient Address</label>
            <input
              id="recipient"
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className={`form-input ${!isValidAddress(recipient) && recipient ? 'invalid' : ''}`}
            />
            {recipient && !isValidAddress(recipient) && (
              <span className="error-text">Invalid address format</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount (ETH)</label>
            <div className="amount-input-group">
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                step="0.0001"
                min="0"
                className={`form-input ${!isValidAmount(amount) && amount ? 'invalid' : ''}`}
              />
              <button onClick={handleMaxAmount} className="max-button">
                MAX
              </button>
            </div>
            <div className="balance-info">
              Available: {userBalance} ETH
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <div className="transaction-summary">
            <h3>Transaction Summary</h3>
            <div className="summary-row">
              <span>To:</span>
              <span>{recipient ? formatAddress(recipient) : "..."}</span>
            </div>
            <div className="summary-row">
              <span>Amount:</span>
              <span>{amount || "0"} ETH</span>
            </div>
            <div className="summary-row">
              <span>Gas Fee:</span>
              <span>~0.001 ETH</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>{amount ? (parseFloat(amount) + 0.001).toFixed(4) : "0"} ETH</span>
            </div>
          </div>

          <div className="modal-actions">
            <button onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!recipient || !amount || isLoading || !isValidAddress(recipient) || !isValidAmount(amount)}
              className="send-button"
            >
              {isLoading ? "Sending..." : "Send Transaction"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendCrypto;