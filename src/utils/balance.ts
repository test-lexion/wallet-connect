import { formatEther, type Address } from "viem";
import { getBalance, getAccount } from "@wagmi/core";
import { config } from "../config";

/**
 * Get ETH balance for a given address
 * @param address - The wallet address to check
 * @returns Promise<string> - Formatted ETH balance
 */
export async function getEthBalance(address: Address): Promise<string> {
  try {
    const balance = await getBalance(config, {
      address,
    });
    
    return formatEther(balance.value);
  } catch (error) {
    console.error("Error fetching ETH balance:", error);
    throw error;
  }
}

/**
 * Get token balance for a given address and token contract
 * @param address - The wallet address to check
 * @param tokenAddress - The token contract address
 * @returns Promise<string> - Formatted token balance
 */
export async function getTokenBalance(
  address: Address,
  tokenAddress: Address
): Promise<string> {
  try {
    const balance = await getBalance(config, {
      address,
      token: tokenAddress,
    });
    
    return formatEther(balance.value);
  } catch (error) {
    console.error("Error fetching token balance:", error);
    throw error;
  }
}

/**
 * Get multiple token balances for a given address
 * @param address - The wallet address to check
 * @param tokenAddresses - Array of token contract addresses
 * @returns Promise<Record<string, string>> - Object with token addresses as keys and balances as values
 */
export async function getMultipleTokenBalances(
  address: Address,
  tokenAddresses: Address[]
): Promise<Record<string, string>> {
  try {
    const balancePromises = tokenAddresses.map(async (tokenAddress) => {
      const balance = await getTokenBalance(address, tokenAddress);
      return { address: tokenAddress, balance };
    });

    const results = await Promise.allSettled(balancePromises);
    const balances: Record<string, string> = {};

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        balances[tokenAddresses[index]] = result.value.balance;
      } else {
        balances[tokenAddresses[index]] = "0.0";
      }
    });

    return balances;
  } catch (error) {
    console.error("Error fetching multiple token balances:", error);
    throw error;
  }
}

/**
 * Get current account information
 * @returns Current account details
 */
export function getCurrentAccount() {
  return getAccount(config);
}

/**
 * Format balance string to display with specified decimal places
 * @param balance - Balance string
 * @param decimals - Number of decimal places (default: 4)
 * @returns Formatted balance string
 */
export function formatBalance(balance: string, decimals: number = 4): string {
  const num = parseFloat(balance);
  if (isNaN(num)) return "0.0000";
  
  return num.toFixed(decimals);
}

/**
 * Convert wei to ether with custom formatting
 * @param wei - Wei value as string or bigint
 * @param decimals - Number of decimal places
 * @returns Formatted ether string
 */
export function weiToEther(wei: string | bigint, decimals: number = 4): string {
  try {
    const ether = formatEther(BigInt(wei));
    return formatBalance(ether, decimals);
  } catch (error) {
    console.error("Error converting wei to ether:", error);
    return "0.0000";
  }
}