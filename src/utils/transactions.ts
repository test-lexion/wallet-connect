import { parseEther, type Address, type Hash } from "viem";
import { sendTransaction, waitForTransactionReceipt } from "@wagmi/core";
import { config } from "../config";

export interface SendTransactionParams {
  to: Address;
  value: string; // ETH amount as string
  data?: `0x${string}`;
}

export interface TransactionResult {
  hash: Hash;
  success: boolean;
  error?: string;
}

/**
 * Send ETH transaction
 * @param params - Transaction parameters
 * @returns Promise<TransactionResult>
 */
export async function sendEthTransaction(
  params: SendTransactionParams
): Promise<TransactionResult> {
  try {
    const hash = await sendTransaction(config, {
      to: params.to,
      value: parseEther(params.value),
      data: params.data,
    });

    // Wait for transaction confirmation
    const receipt = await waitForTransactionReceipt(config, {
      hash,
    });

    return {
      hash,
      success: receipt.status === "success",
    };
  } catch (error) {
    console.error("Error sending transaction:", error);
    return {
      hash: "0x" as Hash,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Validate Ethereum address
 * @param address - Address to validate
 * @returns boolean
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate ETH amount
 * @param amount - Amount string to validate
 * @returns boolean
 */
export function isValidAmount(amount: string): boolean {
  try {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
  } catch {
    return false;
  }
}

/**
 * Format transaction hash for display
 * @param hash - Transaction hash
 * @param length - Number of characters to show from start and end
 * @returns Formatted hash string
 */
export function formatTxHash(hash: string, length: number = 6): string {
  if (hash.length <= length * 2) return hash;
  return `${hash.slice(0, length)}...${hash.slice(-length)}`;
}

/**
 * Format address for display
 * @param address - Ethereum address
 * @param length - Number of characters to show from start and end
 * @returns Formatted address string
 */
export function formatAddress(address: string, length: number = 6): string {
  if (address.length <= length * 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

/**
 * Get transaction URL for explorer
 * @param hash - Transaction hash
 * @param chainId - Chain ID (default: 1 for mainnet)
 * @returns Explorer URL
 */
export function getExplorerUrl(hash: string, chainId: number = 1): string {
  const explorers: Record<number, string> = {
    1: "https://etherscan.io/tx/",
    137: "https://polygonscan.com/tx/",
    8453: "https://basescan.org/tx/",
    42161: "https://arbiscan.io/tx/",
    10: "https://optimistic.etherscan.io/tx/",
  };

  const baseUrl = explorers[chainId] || explorers[1];
  return `${baseUrl}${hash}`;
}