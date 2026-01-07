"use client";

import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUserState } from "../hooks/useUserState";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

export function StatsOverview() {
  const { publicKey } = useWallet();
  const { data: userState } = useUserState();

  const { data: stats } = useQuery({
    queryKey: ["presaleStats"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/presale-stats`);
      return response.json();
    },
    refetchInterval: 5000,
  });

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

  const solDeposited = userStats?.totalSolDeposited || userState?.solTransferred || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 mb-8">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-orange-500/20 rounded-xl p-6 backdrop-blur-sm animate-slide-up">
        <div className="text-sm text-gray-400 mb-2">Total SOL Raised</div>
        <div className="text-3xl font-bold text-orange-400">
          {stats?.totalSolRaised?.toFixed(4) || "0.0000"} <span className="text-xl text-gray-400">SOL</span>
        </div>
        <div className="mt-2 text-xs text-gray-500">Live updates every 5s</div>
      </div>
      
      <div className="bg-gradient-to-br from-gray-900 to-black border border-orange-500/20 rounded-xl p-6 backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="text-sm text-gray-400 mb-2">Total Participants</div>
        <div className="text-3xl font-bold text-orange-400">
          {stats?.participantCount || 0}
        </div>
        <div className="mt-2 text-xs text-gray-500">Active contributors</div>
      </div>
      
      <div className="bg-gradient-to-br from-gray-900 to-black border border-orange-500/20 rounded-xl p-6 backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="text-sm text-gray-400 mb-2">Your Contribution</div>
        <div className="text-3xl font-bold text-orange-400">
          {publicKey ? `${solDeposited.toFixed(4)}` : "—"} <span className="text-xl text-gray-400">SOL</span>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {publicKey ? "Your total contribution" : "Connect wallet to view"}
        </div>
      </div>
    </div>
  );
}

