import { createAppKit } from "@reown/appkit";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { WalletKitClient } from "@reown/walletkit";
import {
  mainnet,
  polygon,
  base,
  solana,
  arbitrum,
  optimism,
} from "@reown/appkit/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";

// Get projectId from https://dashboard.reown.com
export const projectId =
  import.meta.env.VITE_PROJECT_ID || "6308c8b3d501cebc4047d5c6c8b06206";

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Define networks
export const networks = [
  mainnet,
  polygon,
  base,
  solana,
  arbitrum,
  optimism,
] as [AppKitNetwork, ...AppKitNetwork[]];

// Create Wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false,
});

// Export wagmi config for providers
export const config = wagmiAdapter.wagmiConfig;

// Initialize WalletKit for advanced wallet management
export const walletKit = new WalletKitClient({
  projectId,
  metadata: {
    name: "InvestreWallet",
    description: "A modern crypto wallet application",
    url: import.meta.env.DEV ? "http://localhost:5173" : "https://investrewallet.com",
    icons: ["https://investrewallet.com/icon.png"],
  },
});

// Create AppKit instance with embedded wallet and wagmi adapter
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  metadata: {
    name: "InvestreWallet",
    description: "A modern crypto wallet application",
    url: import.meta.env.DEV ? "http://localhost:5173" : "https://investrewallet.com",
    icons: ["https://investrewallet.com/icon.png"],
  },
  features: {
    analytics: true,
    email: true,
    socials: ["google", "github", "apple"],
    emailShowWallets: true,
    swaps: true,
    onramp: true,
  },
  themeMode: "light",
  themeVariables: {
    "--w3m-color-mix": "#00D4AA",
    "--w3m-color-mix-strength": 15,
  },
});