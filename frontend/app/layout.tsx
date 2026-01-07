"use client";

import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SocketProvider } from "../contexts/SocketContext";
import { ToastProvider } from "../components/ToastProvider";
import { useMemo } from "react";
import "@solana/wallet-adapter-react-ui/styles.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <html lang="en">
      <body className={spaceGrotesk.className}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <QueryClientProvider client={queryClient}>
                <SocketProvider>
                  <ToastProvider>
                    <div className="min-h-screen bg-black text-white">
                    <nav className="border-b border-gray-800/50 p-4 backdrop-blur-sm bg-black/50">
                      <div className="container mx-auto flex justify-between items-center">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                          Solana Launchpad
                        </h1>
                        <div className="flex items-center gap-6">
                          <a
                            href="/"
                            className="hover:text-orange-400 text-gray-300 transition-colors"
                          >
                            Presale
                          </a>
                          <a
                            href="/admin"
                            className="hover:text-orange-400 text-gray-300 transition-colors"
                          >
                            Admin
                          </a>
                        </div>
                      </div>
                    </nav>
                    <main className="container mx-auto">{children}</main>
                    </div>
                  </ToastProvider>
                </SocketProvider>
              </QueryClientProvider>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </body>
    </html>
  );
}

