"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSocketContext } from "../contexts/SocketContext";
import { getExplorerUrl } from "../utils/transactions";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

interface Activity {
  eventType: string;
  txSignature: string;
  timestamp: string;
  user_pubkey?: string;
  lamports?: number;
  token_amount?: number;
}

export function ActivityFeed() {
  const { socket } = useSocketContext();
  const [activities, setActivities] = useState<Activity[]>([]);

  const { data: initialActivities } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/activities?limit=20`);
      return response.json();
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (initialActivities) {
      setActivities(initialActivities);
    }
  }, [initialActivities]);

  useEffect(() => {
    if (!socket) return;

    const handleDeposit = (data: Activity) => {
      setActivities((prev) => [data, ...prev].slice(0, 50));
    };

    const handleDistribute = (data: Activity) => {
      setActivities((prev) => [data, ...prev].slice(0, 50));
    };

    const handleEnableDistribution = (data: Activity) => {
      setActivities((prev) => [data, ...prev].slice(0, 50));
    };

    socket.on("deposit", handleDeposit);
    socket.on("distribute", handleDistribute);
    socket.on("enable_distribution", handleEnableDistribution);

    return () => {
      socket.off("deposit", handleDeposit);
      socket.off("distribute", handleDistribute);
      socket.off("enable_distribution", handleEnableDistribution);
    };
  }, [socket]);

  const formatEventType = (eventType: string) => {
    console.log("EVENT TYPE IN FORMAT EVENT TYPE: ", eventType);
    return eventType
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatAmount = (activity: Activity) => {
    if (activity.lamports) {
      return `${(activity.lamports / 1e9).toFixed(4)} SOL`;
    }
    if (activity.token_amount) {
      return `${(activity.token_amount / 1e9).toFixed(4)} Tokens`;
    }
    return "-";
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Live Activity Feed</h2>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-gray-400">No activity yet</p>
        ) : (
          activities.map((activity, index) => (
            <div
              key={`${activity.txSignature}-${index}`}
              className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{formatEventType(activity?.eventType)}</span>
                  {activity.user_pubkey && (
                    <span className="text-sm text-gray-400">
                      {activity.user_pubkey.slice(0, 4)}...{activity.user_pubkey.slice(-4)}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {formatAmount(activity)} • {new Date(activity.timestamp).toLocaleString()}
                </div>
              </div>
              <a
                href={getExplorerUrl(activity.txSignature)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline text-sm"
              >
                View
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

