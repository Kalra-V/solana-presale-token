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
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { CronJob } from "cron";
dotenv.config();

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const PROGRAM_ID = new PublicKey(
  "AEoUYX3Jdp5fMb4vG9wWxhLYTZESdZU7PJaC6BrkRtM9"
);

const MINT_ADDRESS = new PublicKey(
  "9PW5vownEEBguqy1WEcCH55vzyLb18428RdFagq7mLfe"
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

// export const initializeCentralPda = async () => {
//   let blockhash = await connection.getLatestBlockhash();

//   const instructions = [
//     await program.methods
//       .initializeCentralPda()
//       .accounts({
//         signer: wallet.publicKey,
//         // mint: MINT_ADDRESS,
//         // tokenProgram: TOKEN_2022_PROGRAM_ID,
//         system_program: SystemProgram.programId,
//       })
//       .instruction(),
//   ];

//   const messageV0 = new web3.TransactionMessage({
//     payerKey: wallet.publicKey,
//     recentBlockhash: blockhash.blockhash,
//     instructions: instructions,
//   }).compileToV0Message();

//   const transaction = new web3.VersionedTransaction(messageV0);

//   transaction.sign([wallet]);

//   const txSignature = await connection.sendTransaction(transaction);

//   console.log("Transaction hash", txSignature);
//   console.log(`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`);
// };

// // LAST INITIALIZED WITH SEEDS =  "presale-central-latest-v1"

// initializeCentralPda()
//   .then(async () => {
//     console.log("Initialized Central PDA!");
//   })
//   .catch((error) => {
//     console.error("Error initializing Central PDA: ", error);
//   });

// export const initializeUser = async () => {
//   let blockhash = await connection.getLatestBlockhash();

//   const instructions = [
//     await program.methods
//       .initializeUser()
//       .accounts({
//         signer: wallet.publicKey,
//         mint: MINT_ADDRESS,
//         tokenProgram: TOKEN_2022_PROGRAM_ID,
//         system_program: SystemProgram.programId,
//       })
//       .instruction(),
//   ];

//   const messageV0 = new web3.TransactionMessage({
//     payerKey: wallet.publicKey,
//     recentBlockhash: blockhash.blockhash,
//     instructions: instructions,
//   }).compileToV0Message();

//   const transaction = new web3.VersionedTransaction(messageV0);

//   transaction.sign([wallet]);

//   const txSignature = await connection.sendTransaction(transaction);

//   console.log("Transaction hash", txSignature);
//   console.log(`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`);
// };

// initializeUser()
//   .then(async () => {
//     console.log("Initialized User State!");
//   })
//   .catch((error) => {
//     console.error("Error initializing User State: ", error);
//   });

// export const deposit = async () => {
//   let blockhash = await connection.getLatestBlockhash();

//   const [centralPda] = PublicKey.findProgramAddressSync(
//     [Buffer.from("presale-central-latest")],
//     PROGRAM_ID
//   );

//   console.log("CENTRAL PDA: ", centralPda);

//   const [userState] = PublicKey.findProgramAddressSync(
//     [Buffer.from("presale-user-acc"), wallet.publicKey.toBuffer()],
//     PROGRAM_ID
//   );

//   // const pdaTokenAccount = getAssociatedTokenAddressSync(
//   //   MINT_ADDRESS,
//   //   centralPda,
//   //   true,
//   //   TOKEN_2022_PROGRAM_ID,
//   //   ASSOCIATED_TOKEN_PROGRAM_ID
//   // )

//   // const userTokenAccount = getAssociatedTokenAddressSync(
//   //   MINT_ADDRESS,
//   //   wallet.publicKey,
//   //   true,
//   //   TOKEN_2022_PROGRAM_ID,
//   //   ASSOCIATED_TOKEN_PROGRAM_ID
//   // )

//   const instructions = [
//     await program.methods
//       .deposit(new BN(1 * LAMPORTS_PER_SOL))
//       .accounts({
//         signer: wallet.publicKey,
//         // mint: MINT_ADDRESS,
//         central_pda: centralPda,
//         // pdaTokenAccount: pdaTokenAccount,
//         user_state: userState,
//         // userTokenAccount: userTokenAccount,
//         // tokenProgram: TOKEN_2022_PROGRAM_ID,
//         system_program: SystemProgram.programId,
//       })
//       .instruction(),
//   ];

//   const messageV0 = new web3.TransactionMessage({
//     payerKey: wallet.publicKey,
//     recentBlockhash: blockhash.blockhash,
//     instructions: instructions,
//   }).compileToV0Message();

//   const transaction = new web3.VersionedTransaction(messageV0);

//   transaction.sign([wallet]);

//   const txSignature = await connection.sendTransaction(transaction, { skipPreflight: true });

//   console.log("Transaction hash", txSignature);
//   console.log(`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`);
// };

// deposit()
//   .then(async () => {
//     console.log("Deposited 1 SOL To Central PDA & Updated User State!");
//   })
//   .catch((error) => {
//     console.error(
//       "Error depositing 1 SOL To Central PDA & updating User State ",
//       error
//     );
//   });

export const enableDistribution = async () => {
  let blockhash = await connection.getLatestBlockhash();

  const [centralPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("presale-central-latest-v1")],
    PROGRAM_ID
  );

  const instructions = [
    await program.methods
      .enableDistribution()
      .accounts({
        signer: wallet.publicKey,
        central_pda: centralPda,
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

  const txSignature = await connection.sendTransaction(transaction, {
    skipPreflight: true,
  });

  console.log("Transaction hash", txSignature);
  console.log(`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`);
};

const job = new CronJob("5 * * * * *", function () {
  const d = new Date();
  console.log("After some time, calling the ix:", d);
  // FAILS TO DESERIALIZE THE ACC??????
  enableDistribution()
    .then(async () => {
      console.log("Deposited 1 SOL To Central PDA & Updated User State!");
    })
    .catch((error) => {
      console.error(
        "Error depositing 1 SOL To Central PDA & updating User State ",
        error
      );
    });
});
console.log("After job instantiation");
job.start();