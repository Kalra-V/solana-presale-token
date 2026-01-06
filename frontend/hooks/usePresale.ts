import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { useProgram } from "../lib/anchor";
import {
  buildInitializeUserTransaction,
  buildDepositTransaction,
  buildClaimTransaction,
  getExplorerUrl,
} from "../utils/transactions";
import { BN } from "@coral-xyz/anchor";

export function usePresale() {
  const { publicKey, wallet, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const programData = useProgram();
  const queryClient = useQueryClient();

  const initializeUser = useMutation({
    mutationFn: async () => {
      console.log("PUB KEY: ", publicKey?.toString());
      console.log("PROGRAM DATA KEY: ", programData);
      if (!publicKey || !programData) {
        throw new Error("Wallet not connected");
      }

      const instruction = await buildInitializeUserTransaction(
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

      // transaction.sign([wallet?.adapter])

      // await signTransaction(transaction);

      const signature = await sendTransaction(transaction, connection);

      // const signature = await wallet?.adapter.sendTransaction(
      //   transaction,
      //   connection
      // );

      // await connection.confirmTransaction(signature, "confirmed");

      queryClient.invalidateQueries({ queryKey: ["userState"] });

      return { signature, explorerUrl: getExplorerUrl(signature!) };
    },
  });

  const deposit = useMutation({
    mutationFn: async (amountSol: number) => {
      if (!publicKey || !programData) {
        throw new Error("Wallet not connected");
      }

      const amountLamports = Math.floor(amountSol * LAMPORTS_PER_SOL);
      console.log("AMOUNT LAMPORTS: ", amountLamports);
      const instruction = await buildDepositTransaction(
        programData.program,
        publicKey,
        amountLamports
      );

      const { blockhash } = await connection.getLatestBlockhash();
      const messageV0 = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: blockhash,
        instructions: [instruction],
      }).compileToV0Message();

      const transaction = new VersionedTransaction(messageV0);

      transaction.sign([]);
      // const signature = await sendTransaction(transaction, connection);

      const signature = await sendTransaction(transaction, connection);

      // const signature = await connection.sendTransaction(transaction);

      queryClient.invalidateQueries({ queryKey: ["userState"] });
      queryClient.invalidateQueries({ queryKey: ["userStats"] });

      return { signature, explorerUrl: getExplorerUrl(signature!) };
    },
  });

  const claimTokens = useMutation({
    mutationFn: async () => {
      if (!publicKey || !programData) {
        throw new Error("Wallet not connected");
      }

      const instruction = await buildClaimTransaction(
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
      const signature = await connection.sendTransaction(transaction);

      // await connection.confirmTransaction(signature, "confirmed");

      queryClient.invalidateQueries({ queryKey: ["userState"] });
      queryClient.invalidateQueries({ queryKey: ["userStats"] });

      return { signature, explorerUrl: getExplorerUrl(signature) };
    },
  });

  return {
    initializeUser,
    deposit,
    claimTokens,
  };
}
