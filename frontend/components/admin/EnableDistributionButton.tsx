"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useProgram } from "../../lib/anchor";
import { buildEnableDistributionTransaction, getExplorerUrl } from "../../utils/transactions";
import { TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { useQueryClient } from "@tanstack/react-query";

export function EnableDistributionButton() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const programData = useProgram();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnableDistribution = async () => {
    if (!publicKey || !programData) {
      alert("Wallet not connected");
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

      alert(`Distribution enabled! View on Explorer: ${getExplorerUrl(signature)}`);
    } catch (error: any) {
      alert(`Failed to enable distribution: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4">Enable Distribution</h3>
      <p className="text-gray-400 text-sm mb-4">
        Once enabled, users will be able to claim their tokens. This action cannot be undone.
      </p>
      <button
        onClick={handleEnableDistribution}
        disabled={isLoading || !publicKey}
        className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Processing..." : "Enable Distribution"}
      </button>
    </div>
  );
}

