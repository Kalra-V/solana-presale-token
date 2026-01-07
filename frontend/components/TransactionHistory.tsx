"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { getExplorerUrl } from "../utils/transactions";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

export function TransactionHistory() {
  const { publicKey } = useWallet();

  const { data: userStats } = useQuery({
    queryKey: ["userStats", publicKey?.toString()],
    queryFn: async () => {
      if (!publicKey) return null;
      const response = await fetch(`${API_URL}/api/user-stats/${publicKey.toString()}`);
      return response.json();
    },
    enabled: !!publicKey,
    refetchInterval: 10000,
  });

  if (!publicKey) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-black border border-orange-500/20 rounded-xl p-6 backdrop-blur-sm">
        <p className="text-gray-400">Connect your wallet to view transaction history</p>
      </div>
    );
  }

  const deposits = userStats?.deposits || [];

  if (deposits.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-black border border-orange-500/20 rounded-xl p-6 backdrop-blur-sm">
        <h2 className="text-xl font-bold mb-4 text-white">Transaction History</h2>
        <p className="text-gray-400">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-orange-500/20 rounded-xl p-6 backdrop-blur-sm animate-slide-up">
      <h2 className="text-xl font-bold mb-4 text-white">Transaction History</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 text-gray-400">Amount</th>
              <th className="text-left py-2 text-gray-400">Date</th>
              <th className="text-left py-2 text-gray-400">Transaction</th>
            </tr>
          </thead>
          <tbody>
            {deposits.map((deposit: any, index: number) => (
              <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-900/50 transition-colors">
                <td className="py-2 text-orange-400">{deposit.amount.toFixed(4)} SOL</td>
                <td className="py-2 text-gray-400">
                  {new Date(deposit.timestamp).toLocaleString()}
                </td>
                <td className="py-2">
                  <a
                    href={getExplorerUrl(deposit.txSignature)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400 hover:text-orange-300 underline transition-colors"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

