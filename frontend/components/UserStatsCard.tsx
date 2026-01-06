"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { useUserState } from "../hooks/useUserState";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

export function UserStatsCard() {
  const { publicKey } = useWallet();
  const { data: userState } = useUserState();

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
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <p className="text-gray-400">Connect your wallet to view stats</p>
      </div>
    );
  }

  const solDeposited = userStats?.totalSolDeposited || userState?.solTransferred || 0;
  const estimatedTokens = solDeposited * 0.1;
  const isDistributed = userStats?.isDistributed || userState?.isDistributed || false;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Your Stats</h2>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-400">Total SOL Deposited:</span>
          <span className="font-semibold">{solDeposited.toFixed(4)} SOL</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Estimated Tokens:</span>
          <span className="font-semibold">{estimatedTokens.toFixed(4)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Distribution Status:</span>
          <span
            className={`font-semibold ${
              isDistributed ? "text-green-400" : "text-yellow-400"
            }`}
          >
            {isDistributed ? "Claimed" : "Pending"}
          </span>
        </div>
      </div>
    </div>
  );
}

