import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import idl from "../../app/idl/solana_presale_token.json";
import type { SolanaPresaleToken } from "../../target/types/solana_presale_token";
import { getConnection, PROGRAM_ID } from "./solana";

export function useProgram() {
  const { wallet, publicKey } = useWallet();
  const { connection } = useConnection();

  return useMemo(() => {
    // Check both publicKey and wallet.adapter to ensure wallet is fully ready
    if (!publicKey || !wallet?.adapter || !connection) {
      return null;
    }

    const provider = new AnchorProvider(
      connection,
      wallet.adapter as any,
      { commitment: "confirmed" }
    );

    const program: Program<SolanaPresaleToken> = new Program(
      idl as SolanaPresaleToken,
      // new PublicKey(PROGRAM_ID),
      provider
    );

    return { program, provider, connection };
  }, [wallet, publicKey, connection]);
}

