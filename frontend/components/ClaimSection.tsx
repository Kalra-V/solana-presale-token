"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePresale } from "../hooks/usePresale";
import { useUserState } from "../hooks/useUserState";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "./ToastProvider";
import { Confetti } from "./Confetti";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

export function ClaimSection() {
  const { publicKey } = useWallet();
  const { claimTokens } = usePresale();
  const { data: userState } = useUserState();
  const { showToast } = useToast();
  const [showConfetti, setShowConfetti] = useState(false);

  const { data: presaleStats } = useQuery({
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
  });

  if (!publicKey) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <p className="text-gray-400">Connect your wallet to claim tokens</p>
      </div>
    );
  }

  const solDeposited = userStats?.totalSolDeposited || userState?.solTransferred || 0;
  const claimableTokens = solDeposited * 0.1;
  const isDistributed = userStats?.isDistributed || userState?.isDistributed || false;
  const canClaim = presaleStats?.isDistributable && !isDistributed && solDeposited > 0;

  const handleClaim = async () => {
    if (!canClaim) return;

    try {
      const result = await claimTokens.mutateAsync();
      setShowConfetti(true);
      showToast(
        "Tokens claimed successfully!",
        "success",
        {
          link: result.explorerUrl,
          signature: result.signature,
        }
      );
    } catch (error: any) {
      showToast(`Claim failed: ${error.message}`, "error");
    }
  };

  return (
    <>
      <Confetti trigger={showConfetti} />
      <div className="bg-gradient-to-br from-gray-900 to-black border border-orange-500/20 rounded-xl p-6 backdrop-blur-sm animate-slide-up">
      <h2 className="text-xl font-bold mb-4 text-white">Claim Tokens</h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Claimable Tokens:</span>
          <span className="font-semibold text-lg text-orange-400">{claimableTokens.toFixed(4)}</span>
        </div>
        <button
          onClick={handleClaim}
          disabled={!canClaim || claimTokens.isPending}
          className={`w-full px-6 py-3 rounded-lg font-semibold transition-all ${
            canClaim
              ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
              : "bg-gray-800 border border-gray-700 cursor-not-allowed opacity-50"
          }`}
        >
          {claimTokens.isPending
            ? "Processing..."
            : isDistributed
            ? "Already Claimed"
            : !presaleStats?.isDistributable
            ? "Distribution Not Enabled"
            : solDeposited === 0
            ? "No Tokens to Claim"
            : "Claim Tokens"}
        </button>
      </div>
    </div>
    </>
  );
}

