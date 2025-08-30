/// <reference types="vite/client" />

interface ArweaveWallet {
  getActiveAddress(): Promise<string>;
  connect(permissions: string[]): Promise<void>;
  disconnect(): Promise<void>;
  // Add other wallet methods as needed
}

declare global {
  interface Window {
    arweaveWallet?: ArweaveWallet;
  }
}
