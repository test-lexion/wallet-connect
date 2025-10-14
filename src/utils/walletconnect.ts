import { WalletConnectModal } from "@walletconnect/modal";
import { Core } from "@walletconnect/core";
import type { SessionTypes } from "@walletconnect/types";
import { getSdkError } from "@walletconnect/utils";

export class WalletConnectService {
  private core: Core;
  private modal: WalletConnectModal;
  private session: SessionTypes.Struct | null = null;
  
  constructor(projectId: string) {
    this.core = new Core({
      projectId,
    });
    
    this.modal = new WalletConnectModal({
      projectId,
      chains: ["eip155:1", "eip155:137", "eip155:8453"], // Ethereum, Polygon, Base
    });
  }

  /**
   * Initialize WalletConnect session
   */
  async connect(): Promise<SessionTypes.Struct> {
    try {
      const { uri, approval } = await this.core.connect({
        requiredNamespaces: {
          eip155: {
            methods: ["eth_sendTransaction", "personal_sign", "eth_signTypedData"],
            chains: ["eip155:1", "eip155:137", "eip155:8453"],
            events: ["accountsChanged", "chainChanged"],
          },
        },
      });

      if (uri) {
        this.modal.openModal({ uri });
      }

      this.session = await approval();
      this.modal.closeModal();
      
      return this.session;
    } catch (error) {
      console.error("WalletConnect connection failed:", error);
      throw error;
    }
  }

  /**
   * Disconnect current session
   */
  async disconnect(): Promise<void> {
    if (this.session) {
      try {
        await this.core.disconnect({
          topic: this.session.topic,
          reason: getSdkError("USER_DISCONNECTED"),
        });
        this.session = null;
      } catch (error) {
        console.error("WalletConnect disconnect failed:", error);
        throw error;
      }
    }
  }

  /**
   * Send transaction request
   */
  async sendTransaction(params: {
    to: string;
    value: string;
    data?: string;
  }): Promise<string> {
    if (!this.session) {
      throw new Error("No active WalletConnect session");
    }

    try {
      const result = await this.core.request({
        topic: this.session.topic,
        chainId: "eip155:1",
        request: {
          method: "eth_sendTransaction",
          params: [params],
        },
      });

      return result as string;
    } catch (error) {
      console.error("WalletConnect transaction failed:", error);
      throw error;
    }
  }

  /**
   * Sign message
   */
  async signMessage(message: string): Promise<string> {
    if (!this.session) {
      throw new Error("No active WalletConnect session");
    }

    try {
      const result = await this.core.request({
        topic: this.session.topic,
        chainId: "eip155:1",
        request: {
          method: "personal_sign",
          params: [message, this.getAddress()],
        },
      });

      return result as string;
    } catch (error) {
      console.error("WalletConnect sign message failed:", error);
      throw error;
    }
  }

  /**
   * Get connected account address
   */
  getAddress(): string {
    if (!this.session) {
      return "";
    }

    const accounts = this.session.namespaces.eip155?.accounts || [];
    if (accounts.length > 0) {
      // Extract address from account string (format: eip155:1:0x...)
      return accounts[0].split(":")[2] || "";
    }

    return "";
  }

  /**
   * Get current session
   */
  getSession(): SessionTypes.Struct | null {
    return this.session;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.session !== null;
  }

  /**
   * Set up event listeners
   */
  setupEventListeners(callbacks: {
    onSessionUpdate?: (session: SessionTypes.Struct) => void;
    onSessionDelete?: () => void;
  }): void {
    this.core.on("session_update", ({ session }) => {
      this.session = session;
      callbacks.onSessionUpdate?.(session);
    });

    this.core.on("session_delete", () => {
      this.session = null;
      callbacks.onSessionDelete?.();
    });
  }
}