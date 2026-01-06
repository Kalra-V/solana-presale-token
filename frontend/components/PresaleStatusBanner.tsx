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
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div
      className={`border rounded-lg p-4 ${
        stats.isDistributable
          ? "bg-green-900/20 border-green-500"
          : "bg-yellow-900/20 border-yellow-500"
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            stats.isDistributable ? "bg-green-500" : "bg-yellow-500"
          }`}
        ></div>
        <span className="font-semibold">
          {stats.isDistributable
            ? "Distribution Enabled - Tokens can be claimed!"
            : "Distribution Not Enabled - Presale Active"}
        </span>
      </div>
    </div>
  );
}

