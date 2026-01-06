"use client";

import { useQuery } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

export function AdminStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["presaleStats"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/presale-stats`);
      return response.json();
    },
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Presale Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400 mb-1">Total SOL Raised</div>
          <div className="text-2xl font-bold">
            {stats?.totalSolRaised?.toFixed(4) || "0.0000"} SOL
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400 mb-1">Total Participants</div>
          <div className="text-2xl font-bold">
            {stats?.participantCount || 0}
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400 mb-1">Distribution Status</div>
          <div
            className={`text-2xl font-bold ${
              stats?.isDistributable ? "text-green-400" : "text-yellow-400"
            }`}
          >
            {stats?.isDistributable ? "Enabled" : "Disabled"}
          </div>
        </div>
      </div>
    </div>
  );
}

