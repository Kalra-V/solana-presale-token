import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useProgram } from "../lib/anchor";
import { getUserStatePDA } from "../utils/transactions";

export function useUserState() {
  const { publicKey } = useWallet();
  const programData = useProgram();

  return useQuery({
    queryKey: ["userState", publicKey?.toString()],
    queryFn: async () => {
      if (!publicKey || !programData) {
        return null;
      }

      const [userStatePDA] = getUserStatePDA(publicKey);

      try {
        const userState = await programData.program.account.userState.fetch(userStatePDA);
        return {
          userPubkey: userState.userPubkey.toString(),
          solTransferred: Number(userState.solTransferred) / 1e9, // Convert to SOL
          isDistributed: userState.isDistributed,
        };
      } catch (error) {
        // User state doesn't exist yet
        return null;
      }
    },
    enabled: !!publicKey && !!programData,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

