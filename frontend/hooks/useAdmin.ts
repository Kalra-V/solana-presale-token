import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { useProgram } from "../lib/anchor";
import {
  buildEnableDistributionTransaction,
  buildClaimTransaction,
  getExplorerUrl,
} from "../utils/transactions";
import { PublicKey } from "@solana/web3.js";

export function useAdmin() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const programData = useProgram();
  const queryClient = useQueryClient();

  const enableDistribution = useMutation({
    mutationFn: async () => {
      if (!publicKey || !programData) {
        throw new Error("Wallet not connected");
      }

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

      return { signature, explorerUrl: getExplorerUrl(signature) };
    },
  });

  const distributeToUser = useMutation({
    mutationFn: async (userPubkey: PublicKey) => {
      if (!publicKey || !programData) {
        throw new Error("Wallet not connected");
      }

      const instruction = await buildClaimTransaction(
        programData.program,
        userPubkey
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

      queryClient.invalidateQueries({ queryKey: ["participants"] });

      return { signature, explorerUrl: getExplorerUrl(signature) };
    },
  });

  return {
    enableDistribution,
    distributeToUser,
  };
}

