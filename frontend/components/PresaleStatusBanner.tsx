"use client";

import { useQuery } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

export function PresaleStatusBanner() {
  const { data: stats } = useQuery({
    queryKey: ["presaleStats"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/presale-stats`);
      return response.json();
    },
    refetchInterval: 5000,
  });

  if (!stats) {
    return (
      <div className="mx-6 bg-gray-900/50 border border-orange-500/20 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div
      className={`mx-6 border rounded-xl p-4 backdrop-blur-sm ${
        stats.isDistributable
          ? "bg-green-900/20 border-green-500/50"
          : "bg-orange-900/20 border-orange-500/50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-3 h-3 rounded-full animate-pulse-glow ${
            stats.isDistributable ? "bg-green-500" : "bg-orange-500"
          }`}
        ></div>
        <span className="font-semibold text-white">
          {stats.isDistributable
            ? "Distribution Enabled - Tokens can be claimed!"
            : "Distribution Not Enabled - Presale Active"}
        </span>
      </div>
    </div>
  );
}

