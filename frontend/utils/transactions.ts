import { PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PROGRAM_ID, MINT_ADDRESS } from "../lib/solana";
import { BN, type Program } from "@coral-xyz/anchor";
import type { SolanaPresaleToken } from "../../target/types/solana_presale_token";

export function getUserStatePDA(userPubkey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("presale-user-latest-v2"), userPubkey.toBuffer()],
    new PublicKey(PROGRAM_ID)
  );
}

export function getCentralPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("presale-central-latest-v2")],
    new PublicKey(PROGRAM_ID)
  );
}

export async function buildInitializeUserTransaction(
  program: Program<SolanaPresaleToken>,
  userPubkey: PublicKey
) {
  const [userStatePDA] = getUserStatePDA(userPubkey);
  const mintPubkey = new PublicKey(MINT_ADDRESS);

  const userTokenAccount = getAssociatedTokenAddressSync(
    mintPubkey,
    userPubkey,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const instruction = await program.methods
    .initializeUser()
    .accounts({
      signer: userPubkey,
      mint: mintPubkey,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
    })
    .instruction();

  return instruction;
}

export async function buildDepositTransaction(
  program: Program<SolanaPresaleToken>,
  userPubkey: PublicKey,
  amountLamports: number
) {
  const instruction = await program.methods
    .deposit(new BN(amountLamports))
    .accounts({
      signer: userPubkey,
    })
    .instruction();

  return instruction;
}

export async function buildClaimTransaction(
  program: Program<SolanaPresaleToken>,
  userPubkey: PublicKey
) {
  const mintPubkey = new PublicKey(MINT_ADDRESS);
  const [centralPDA] = getCentralPDA();
  const [userStatePDA] = getUserStatePDA(userPubkey);

  const pdaTokenAccount = getAssociatedTokenAddressSync(
    mintPubkey,
    centralPDA,
    true,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const userTokenAccount = getAssociatedTokenAddressSync(
    mintPubkey,
    userPubkey,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const instruction = await program.methods
    .distribute()
    .accounts({
      signer: userPubkey,
      mint: mintPubkey,
      pdaTokenAccount: pdaTokenAccount,
      userTokenAccount: userTokenAccount,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
    })
    .instruction();

  return instruction;
}

export async function buildDistributeTransactionForUser(
  program: Program<SolanaPresaleToken>,
  userPubkey: PublicKey
) {
  // This is the same as buildClaimTransaction, but named for clarity in admin context
  return buildClaimTransaction(program, userPubkey);
}

export async function buildEnableDistributionTransaction(
  program: Program<SolanaPresaleToken>,
  adminPubkey: PublicKey
) {
  const instruction = await program.methods
    .enableDistribution()
    .accounts({
      signer: adminPubkey,
    })
    .instruction();

  return instruction;
}

export function getExplorerUrl(signature: string, cluster: string = "devnet"): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
}

