import { Connection, clusterApiUrl } from "@solana/web3.js";

export const getConnection = () => {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl("devnet");
  return new Connection(rpcUrl, "confirmed");
};

export const PROGRAM_ID = process.env.NEXT_PUBLIC_PROGRAM_ID || "HnQPtPdUZnYQpqX14QiP1CFY9x49hUyDCaaXUjRLH1JJ";
export const MINT_ADDRESS = process.env.NEXT_PUBLIC_MINT_ADDRESS || "9PW5vownEEBguqy1WEcCH55vzyLb18428RdFagq7mLfe";
export const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET || "GXNk9AHSB83MYhjYyCt3tXwGAq2eHHh7AEanXfkBbX3J";

