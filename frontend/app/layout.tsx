"use client";

import { Inter } from "next/font/google";
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

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <QueryClientProvider client={queryClient}>
                <SocketProvider>
                  <ToastProvider>
                    <div className="min-h-screen bg-black text-white">
                    <nav className="border-b border-gray-800 p-4">
                      <div className="container mx-auto flex justify-between items-center">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                          Token Presale
                        </h1>
                        <div className="flex items-center gap-4">
                          <a
                            href="/"
                            className="hover:text-purple-400 transition-colors"
                          >
                            Presale
                          </a>
                          <a
                            href="/admin"
                            className="hover:text-purple-400 transition-colors"
                          >
                            Admin
                          </a>
                        </div>
                      </div>
                    </nav>
                    <main className="container mx-auto p-6">{children}                    </main>
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

