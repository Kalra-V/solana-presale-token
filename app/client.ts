import { BN, Program, web3 } from "@coral-xyz/anchor";
import type { SolanaPresaleToken } from "../target/types/solana_presale_token";
import idl from "./idl/solana_presale_token.json";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const PROGRAM_ID = new PublicKey(
  "AEoUYX3Jdp5fMb4vG9wWxhLYTZESdZU7PJaC6BrkRtM9"
);

let wallet: Keypair;

try {
  const keypairPath = process.env.SOLANA_KEYPAIR_PATH;

  if (!keypairPath) {
    throw new Error("SOLANA_KEYPAIR_PATH env var is not set");
  }

  wallet = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(keypairPath, "utf8")))
  );
  console.log("Wallet loaded successfully");
} catch (error) {
  console.error("Error loading wallet", error);
}

export const program = new Program(idl as SolanaPresaleToken, { connection });

export const initializeCentralPda = async () => {
  let blockhash = await connection.getLatestBlockhash();

  const instructions = [
    await program.methods
      .initializeCentralPda()
      .accounts({
        signer: wallet.publicKey,
        system_program: SystemProgram.programId,
      })
      .instruction(),
  ];

  const messageV0 = new web3.TransactionMessage({
    payerKey: wallet.publicKey,
    recentBlockhash: blockhash.blockhash,
    instructions: instructions,
  }).compileToV0Message();

  const transaction = new web3.VersionedTransaction(messageV0);

  transaction.sign([wallet]);

  const txSignature = await connection.sendTransaction(transaction);

  console.log("Transaction hash", txSignature);
  console.log(`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`);
};

// initializeCentralPda()
//   .then(async () => {
//     console.log("Initialized Central PDA!");
//   })
//   .catch((error) => {
//     console.error("Error initializing Central PDA: ", error);
//   });

export const initializeUser = async () => {
  let blockhash = await connection.getLatestBlockhash();

  const instructions = [
    await program.methods
      .initializeUser()
      .accounts({
        signer: wallet.publicKey,
        system_program: SystemProgram.programId,
      })
      .instruction(),
  ];

  const messageV0 = new web3.TransactionMessage({
    payerKey: wallet.publicKey,
    recentBlockhash: blockhash.blockhash,
    instructions: instructions,
  }).compileToV0Message();

  const transaction = new web3.VersionedTransaction(messageV0);

  transaction.sign([wallet]);

  const txSignature = await connection.sendTransaction(transaction);

  console.log("Transaction hash", txSignature);
  console.log(`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`);
};

// initializeUser()
//   .then(async () => {
//     console.log("Initialized User State!");
//   })
//   .catch((error) => {
//     console.error("Error initializing User State: ", error);
//   });

export const deposit = async () => {
  let blockhash = await connection.getLatestBlockhash();

  const [centralPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("presale-central")],
    PROGRAM_ID
  );

  const [userState] = PublicKey.findProgramAddressSync(
    [Buffer.from("presale-user"), wallet.publicKey.toBuffer()],
    PROGRAM_ID
  );

  const instructions = [
    await program.methods
      .deposit(new BN(1 * LAMPORTS_PER_SOL))
      .accounts({
        signer: wallet.publicKey,
        central_pda: centralPda,
        user_state: userState,
        system_program: SystemProgram.programId,
      })
      .instruction(),
  ];

  const messageV0 = new web3.TransactionMessage({
    payerKey: wallet.publicKey,
    recentBlockhash: blockhash.blockhash,
    instructions: instructions,
  }).compileToV0Message();

  const transaction = new web3.VersionedTransaction(messageV0);

  transaction.sign([wallet]);

  const txSignature = await connection.sendTransaction(transaction);

  console.log("Transaction hash", txSignature);
  console.log(`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`);
};

deposit()
  .then(async () => {
    console.log("Deposited 1 SOL To Central PDA & Updated User State!");
  })
  .catch((error) => {
    console.error(
      "Error depositing 1 SOL To Central PDA & updating User State ",
      error
    );
  });
