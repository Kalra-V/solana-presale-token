"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getExplorerUrl } from "../../utils/transactions";
import { useSocketContext } from "../../contexts/SocketContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

export function ParticipantsTable() {
  const { socket } = useSocketContext();
  const queryClient = useQueryClient();
  
  const { data: participants, isLoading } = useQuery({
    queryKey: ["participants"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/participants`);
      return response.json();
    },
    refetchInterval: 10000,
  });

  // Listen for distribute events to update status in real-time
  useEffect(() => {
    if (!socket) return;

    const handleDistributeEvent = (data: any) => {
      console.log("Distribute event received in ParticipantsTable:", data);
      // Invalidate queries to refresh participant status
      queryClient.invalidateQueries({ queryKey: ["participants"] });
    };

    socket.on("distribute", handleDistributeEvent);

    return () => {
      socket.off("distribute", handleDistributeEvent);
    };
  }, [socket, queryClient]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-black border border-orange-500/20 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-orange-500/20 rounded-xl p-6 backdrop-blur-sm">
      <h2 className="text-2xl font-bold mb-4 text-white">Participants</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-400">Wallet</th>
              <th className="text-left py-3 px-4 text-gray-400">Total Deposited</th>
              <th className="text-left py-3 px-4 text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {participants && participants.length > 0 ? (
              participants.map((participant: any, index: number) => (
                <tr
                  key={participant.user_pubkey}
                  className="border-b border-gray-700/50 hover:bg-gray-900/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <a
                      href={getExplorerUrl(participant.user_pubkey, "devnet")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-400 hover:text-orange-300 underline transition-colors"
                    >
                      {participant.user_pubkey.slice(0, 8)}...
                      {participant.user_pubkey.slice(-8)}
                    </a>
                  </td>
                  <td className="py-3 px-4 text-orange-400">
                    {participant.totalDeposited.toFixed(4)} SOL
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        participant.isDistributed
                          ? "bg-green-900/50 text-green-400"
                          : "bg-orange-900/50 text-orange-400"
                      }`}
                    >
                      {participant.isDistributed ? "Claimed" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-8 text-center text-gray-400">
                  No participants yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

