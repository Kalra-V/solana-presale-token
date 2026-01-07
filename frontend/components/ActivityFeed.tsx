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
  const [newActivityIds, setNewActivityIds] = useState<Set<string>>(new Set());

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
      setActivities((prev) => {
        const newActivities = [data, ...prev].slice(0, 50);
        setNewActivityIds((prevIds) => {
          const newSet = new Set(prevIds);
          newSet.add(data.txSignature);
          setTimeout(() => {
            setNewActivityIds((current) => {
              const updated = new Set(current);
              updated.delete(data.txSignature);
              return updated;
            });
          }, 3000);
          return newSet;
        });
        return newActivities;
      });
    };

    const handleDistribute = (data: Activity) => {
      setActivities((prev) => {
        const newActivities = [data, ...prev].slice(0, 50);
        setNewActivityIds((prevIds) => {
          const newSet = new Set(prevIds);
          newSet.add(data.txSignature);
          setTimeout(() => {
            setNewActivityIds((current) => {
              const updated = new Set(current);
              updated.delete(data.txSignature);
              return updated;
            });
          }, 3000);
          return newSet;
        });
        return newActivities;
      });
    };

    const handleEnableDistribution = (data: Activity) => {
      setActivities((prev) => {
        const newActivities = [data, ...prev].slice(0, 50);
        setNewActivityIds((prevIds) => {
          const newSet = new Set(prevIds);
          newSet.add(data.txSignature);
          setTimeout(() => {
            setNewActivityIds((current) => {
              const updated = new Set(current);
              updated.delete(data.txSignature);
              return updated;
            });
          }, 3000);
          return newSet;
        });
        return newActivities;
      });
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

  const isNew = (txSignature: string) => newActivityIds.has(txSignature);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-orange-500/20 rounded-xl p-6 backdrop-blur-sm animate-slide-up">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-bold text-white">Live Activity Feed</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse-glow"></div>
          <span className="text-xs text-orange-400 font-semibold">LIVE</span>
        </div>
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-gray-400">No activity yet</p>
        ) : (
          activities.map((activity, index) => {
            const isNewActivity = isNew(activity.txSignature);
            return (
              <div
                key={`${activity.txSignature}-${index}`}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  isNewActivity
                    ? "bg-orange-500/10 border-orange-500/50 animate-fade-in shadow-lg shadow-orange-500/20"
                    : "bg-gray-900/50 border-gray-700/50 hover:border-orange-500/30"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {isNewActivity && (
                      <span className="text-xs text-orange-400 font-bold">NEW</span>
                    )}
                    <span className="font-semibold text-white">{formatEventType(activity?.eventType)}</span>
                    {activity.user_pubkey && (
                      <span className="text-sm text-gray-400">
                        {activity.user_pubkey.slice(0, 4)}...{activity.user_pubkey.slice(-4)}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    <span className="text-orange-400 font-medium">{formatAmount(activity)}</span> • {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
                <a
                  href={getExplorerUrl(activity.txSignature)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:text-orange-300 underline text-sm transition-colors"
                >
                  View
                </a>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

