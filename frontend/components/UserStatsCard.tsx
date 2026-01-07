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
      <div className="bg-gradient-to-br from-gray-900 to-black border border-orange-500/20 rounded-xl p-6 backdrop-blur-sm">
        <p className="text-gray-400">Connect your wallet to view stats</p>
      </div>
    );
  }

  const solDeposited = userStats?.totalSolDeposited || userState?.solTransferred || 0;
  const estimatedTokens = solDeposited * 0.1;
  const isDistributed = userStats?.isDistributed || userState?.isDistributed || false;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-orange-500/20 rounded-xl p-6 backdrop-blur-sm animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-bold text-white">Your Stats</h2>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse-glow"></div>
          <span className="text-xs text-orange-400">Live</span>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Total SOL Deposited:</span>
          <span className="font-semibold text-orange-400 animate-fade-in">{solDeposited.toFixed(4)} SOL</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Estimated Tokens:</span>
          <span className="font-semibold text-orange-400 animate-fade-in">{estimatedTokens.toFixed(4)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Distribution Status:</span>
          <span
            className={`font-semibold ${
              isDistributed ? "text-green-400" : "text-orange-400"
            }`}
          >
            {isDistributed ? "Claimed" : "Pending"}
          </span>
        </div>
      </div>
    </div>
  );
}

