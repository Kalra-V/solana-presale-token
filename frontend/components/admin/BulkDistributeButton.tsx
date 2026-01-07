"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useProgram } from "../../lib/anchor";
import { buildDistributeTransactionForUser, getExplorerUrl } from "../../utils/transactions";
import { TransactionMessage, VersionedTransaction, PublicKey } from "@solana/web3.js";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { AlertModal } from "../AlertModal";
import { ConfirmationModal } from "../ConfirmationModal";
import { useSocketContext } from "../../contexts/SocketContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

export function BulkDistributeButton() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const programData = useProgram();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant?: "success" | "error" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    variant: "info",
  });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    eligibleCount: number;
  }>({
    isOpen: false,
    eligibleCount: 0,
  });

  const { socket } = useSocketContext();
  const { data: participants } = useQuery({
    queryKey: ["participants"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/participants`);
      return response.json();
    },
    refetchInterval: 5000,
  });

  // Listen for distribute events to update status in real-time
  useEffect(() => {
    if (!socket) return;

    const handleDistributeEvent = (data: any) => {
      console.log("Distribute event received:", data);
      // Invalidate queries to refresh participant status
      queryClient.invalidateQueries({ queryKey: ["participants"] });
      queryClient.invalidateQueries({ queryKey: ["presaleStats"] });
      
      // Update progress if we're currently distributing
      if (isLoading) {
        setProgress((prev) => ({
          current: Math.min(prev.current + 1, prev.total),
          total: prev.total,
        }));
      }
    };

    socket.on("distribute", handleDistributeEvent);

    return () => {
      socket.off("distribute", handleDistributeEvent);
    };
  }, [socket, queryClient, isLoading]);

  const handleBulkDistribute = async () => {
    if (!publicKey || !programData || !participants) {
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: "Wallet not connected or no participants found",
        variant: "error",
      });
      return;
    }

    const eligibleParticipants = participants.filter(
      (p: any) => !p.isDistributed && p.totalDeposited > 0
    );

    if (eligibleParticipants.length === 0) {
      setAlertModal({
        isOpen: true,
        title: "No Eligible Participants",
        message: "No eligible participants to distribute tokens to",
        variant: "warning",
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      eligibleCount: eligibleParticipants.length,
    });
  };

  const confirmBulkDistribute = async () => {
    setConfirmModal({ isOpen: false, eligibleCount: 0 });

    if (!publicKey || !programData || !participants || !connection) return;

    const eligibleParticipants = participants.filter(
      (p: any) => !p.isDistributed && p.totalDeposited > 0
    );

    setIsLoading(true);
    setProgress({ current: 0, total: eligibleParticipants.length });

    const results: Array<{ success: boolean; wallet: string; error?: string; signature?: string }> = [];
    const BATCH_SIZE = 10; // Process in batches to avoid transaction size limits

    try {
      // Process participants in batches
      for (let batchStart = 0; batchStart < eligibleParticipants.length; batchStart += BATCH_SIZE) {
        const batch = eligibleParticipants.slice(batchStart, batchStart + BATCH_SIZE);
        
        // Get latest blockhash for this batch
        const { blockhash } = await connection.getLatestBlockhash();
        
        // Build instructions for this batch
        const instructions = await Promise.all(
          batch.map(async (participant: any) => {
            try {
              const participantPubkey = new PublicKey(participant.user_pubkey);
              return await buildDistributeTransactionForUser(
                programData.program,
                participantPubkey
              );
            } catch (error: any) {
              console.error(`Error building instruction for ${participant.user_pubkey}:`, error);
              throw error;
            }
          })
        );

        // Build all instructions for this batch
        // Following the pattern from app/client.ts where admin signs for all users
        const batchInstructions = await Promise.all(
          batch.map(async (participant: any) => {
            const participantPubkey = new PublicKey(participant.user_pubkey);
            return await buildDistributeTransactionForUser(
              programData.program,
              participantPubkey
            );
          })
        );

        // Create transaction with all instructions in the batch
        // Note: Following app/client.ts pattern, admin wallet signs
        // However, the program may require user signatures - this will need to be verified
        const messageV0 = new TransactionMessage({
          payerKey: publicKey, // Admin pays for transaction fees
          recentBlockhash: blockhash,
          instructions: batchInstructions,
        }).compileToV0Message();

        const transaction = new VersionedTransaction(messageV0);

        try {
          // Send transaction - admin signs it
          // Note: If program requires user signatures, this will fail
          // In that case, you'll need a backend API to handle distribution
          const signature = await sendTransaction(transaction, connection);
          
          // Wait for confirmation
          await connection.confirmTransaction(signature, "confirmed");

          // All participants in batch succeeded
          batch.forEach((participant: any) => {
            results.push({
              success: true,
              wallet: participant.user_pubkey,
              signature: signature,
            });
          });

          setProgress((prev) => ({
            current: Math.min(prev.current + batch.length, prev.total),
            total: prev.total,
          }));
        } catch (error: any) {
          // If transaction fails (e.g., requires user signatures), try backend API
          console.warn("Direct transaction failed, trying backend API:", error.message);
          
          try {
            const response = await fetch(`${API_URL}/api/bulk-distribute`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                participants: batch.map((p: any) => p.user_pubkey),
              }),
            });

            if (response.ok) {
              const batchResults = await response.json();
              batchResults.forEach((result: any) => {
                results.push({
                  success: result.success,
                  wallet: result.wallet,
                  error: result.error,
                  signature: result.signature,
                });
              });
            } else {
              throw new Error(`Backend API error: ${response.statusText}`);
            }
          } catch (apiError: any) {
            // Both direct and API failed - mark all as failed
            batch.forEach((participant: any) => {
              results.push({
                success: false,
                wallet: participant.user_pubkey,
                error: error.message || apiError.message || "Distribution failed",
              });
            });
          }
          
          setProgress((prev) => ({
            current: Math.min(prev.current + batch.length, prev.total),
            total: prev.total,
          }));
        }
      }
    } catch (error: any) {
      console.error("Error during bulk distribution:", error);
      setAlertModal({
        isOpen: true,
        title: "Distribution Error",
        message: `An error occurred during distribution: ${error.message}`,
        variant: "error",
      });
    } finally {
      setIsLoading(false);
      queryClient.invalidateQueries({ queryKey: ["participants"] });
      queryClient.invalidateQueries({ queryKey: ["presaleStats"] });

      const successCount = results.filter((r) => r.success).length;
      const failedCount = results.filter((r) => !r.success).length;
      
      if (results.length > 0) {
        setAlertModal({
          isOpen: true,
          title: "Distribution Complete",
          message: `Bulk distribution completed: ${successCount} successful, ${failedCount} failed out of ${eligibleParticipants.length} total`,
          variant: successCount === eligibleParticipants.length ? "success" : "warning",
        });
      }
    }
  };

  const eligibleCount =
    participants?.filter((p: any) => !p.isDistributed && p.totalDeposited > 0)
      .length || 0;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-orange-500/20 rounded-xl p-6 backdrop-blur-sm">
      <h3 className="text-xl font-bold mb-4 text-white">Bulk Distribute Tokens</h3>
      <p className="text-gray-400 text-sm mb-4">
        Distribute tokens to all eligible participants who haven't claimed yet.
      </p>
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Eligible Participants:</span>
          <span className="font-semibold text-orange-400">{eligibleCount}</span>
        </div>
        {isLoading && (
          <div className="mt-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Progress:</span>
              <span className="font-semibold text-orange-400">
                {progress.current} / {progress.total}
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all"
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
        className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
      >
        {isLoading
          ? `Processing... (${progress.current}/${progress.total})`
          : "Bulk Distribute Tokens"}
      </button>

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmBulkDistribute}
        title="Confirm Bulk Distribution"
        message={`This will distribute tokens to ${confirmModal.eligibleCount} participants. This action cannot be undone. Continue?`}
        confirmText="Distribute Tokens"
        cancelText="Cancel"
        variant="default"
        isLoading={isLoading}
      />
    </div>
  );
}

