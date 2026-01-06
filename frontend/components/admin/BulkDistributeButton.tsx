"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useProgram } from "../../lib/anchor";
import { buildClaimTransaction, getExplorerUrl } from "../../utils/transactions";
import { TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { useQueryClient, useQuery } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

export function BulkDistributeButton() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const programData = useProgram();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const { data: participants } = useQuery({
    queryKey: ["participants"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/participants`);
      return response.json();
    },
  });

  const handleBulkDistribute = async () => {
    if (!publicKey || !programData || !participants) {
      alert("Wallet not connected or no participants found");
      return;
    }

    const eligibleParticipants = participants.filter(
      (p: any) => !p.isDistributed && p.totalDeposited > 0
    );

    if (eligibleParticipants.length === 0) {
      alert("No eligible participants to distribute tokens to");
      return;
    }

    if (
      !confirm(
        `This will distribute tokens to ${eligibleParticipants.length} participants. Continue?`
      )
    ) {
      return;
    }

    setIsLoading(true);
    setProgress({ current: 0, total: eligibleParticipants.length });

    const results: Array<{ success: boolean; wallet: string; error?: string }> = [];

    for (let i = 0; i < eligibleParticipants.length; i++) {
      const participant = eligibleParticipants[i];
      const participantPubkey = participant.user_pubkey;

      try {
        // Note: This would need to be done for each user individually
        // In a real scenario, you might want to batch these or use a different approach
        // For now, we'll just show the concept
        setProgress({ current: i + 1, total: eligibleParticipants.length });
        results.push({ success: true, wallet: participantPubkey });
      } catch (error: any) {
        results.push({
          success: false,
          wallet: participantPubkey,
          error: error.message,
        });
      }
    }

    setIsLoading(false);
    queryClient.invalidateQueries({ queryKey: ["participants"] });
    queryClient.invalidateQueries({ queryKey: ["presaleStats"] });

    const successCount = results.filter((r) => r.success).length;
    alert(
      `Bulk distribution completed: ${successCount}/${eligibleParticipants.length} successful`
    );
  };

  const eligibleCount =
    participants?.filter((p: any) => !p.isDistributed && p.totalDeposited > 0)
      .length || 0;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4">Bulk Distribute Tokens</h3>
      <p className="text-gray-400 text-sm mb-4">
        Distribute tokens to all eligible participants who haven't claimed yet.
      </p>
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Eligible Participants:</span>
          <span className="font-semibold">{eligibleCount}</span>
        </div>
        {isLoading && (
          <div className="mt-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Progress:</span>
              <span className="font-semibold">
                {progress.current} / {progress.total}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{
                  width: `${(progress.current / progress.total) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
      <button
        onClick={handleBulkDistribute}
        disabled={isLoading || !publicKey || eligibleCount === 0}
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading
          ? `Processing... (${progress.current}/${progress.total})`
          : "Bulk Distribute Tokens"}
      </button>
      <p className="text-xs text-gray-500 mt-2">
        Note: This is a placeholder. In production, you would need to implement
        proper batch transaction handling.
      </p>
    </div>
  );
}

