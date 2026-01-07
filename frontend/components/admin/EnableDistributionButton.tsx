"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useProgram } from "../../lib/anchor";
import { buildEnableDistributionTransaction, getExplorerUrl } from "../../utils/transactions";
import { TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "../ToastProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

export function EnableDistributionButton() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const programData = useProgram();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { data: presaleStats } = useQuery({
    queryKey: ["presaleStats"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/presale-stats`);
      return response.json();
    },
    refetchInterval: 5000,
  });

  const isDistributionEnabled = presaleStats?.isDistributable || false;

  const handleEnableDistribution = async () => {
    if (!publicKey || !programData) {
      showToast("Wallet not connected", "error");
      return;
    }

    setIsLoading(true);
    try {
      const instruction = await buildEnableDistributionTransaction(
        programData.program,
        publicKey
      );

      const { blockhash } = await connection.getLatestBlockhash();
      const messageV0 = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: blockhash,
        instructions: [instruction],
      }).compileToV0Message();

      const transaction = new VersionedTransaction(messageV0);
      const signature = await sendTransaction(transaction, connection);

      await connection.confirmTransaction(signature, "confirmed");

      queryClient.invalidateQueries({ queryKey: ["presaleStats"] });

      showToast(
        "Distribution enabled!",
        "success",
        {
          link: getExplorerUrl(signature),
          signature: signature,
        }
      );
    } catch (error: any) {
      showToast(`Failed to enable distribution: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-orange-500/20 rounded-xl p-6 backdrop-blur-sm">
      <h3 className="text-xl font-bold mb-4 text-white">Enable Distribution</h3>
      <p className="text-gray-400 text-sm mb-4">
        Once enabled, users will be able to claim their tokens. This action cannot be undone.
      </p>
      <button
        onClick={handleEnableDistribution}
        disabled={isLoading || !publicKey || isDistributionEnabled}
        className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
      >
        {isLoading ? "Processing..." : isDistributionEnabled ? "Distribution Already Enabled" : "Enable Distribution"}
      </button>
    </div>
  );
}

