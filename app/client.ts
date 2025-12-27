import { BN, Program, web3 } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
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
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { CronJob } from "cron";
dotenv.config();

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const PROGRAM_ID = new PublicKey(
  "HnQPtPdUZnYQpqX14QiP1CFY9x49hUyDCaaXUjRLH1JJ"
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

const walletWrapper = new anchor.Wallet(wallet);

const provider = new anchor.AnchorProvider(connection, walletWrapper, {
  commitment: "confirmed",
});

anchor.setProvider(provider);

export const program: Program<SolanaPresaleToken> = new Program(
  idl as SolanaPresaleToken,
  provider
);

// export const initializeCentralPda = async () => {
//   let blockhash = await connection.getLatestBlockhash();

//   const [centralPda] = PublicKey.findProgramAddressSync(
//     [Buffer.from("presale-central-latest-v2")],
//     PROGRAM_ID
//   );

//   const pdaTokenAccount = await getAssociatedTokenAddress(
//     MINT_ADDRESS,
//     centralPda,
//     true,
//     TOKEN_2022_PROGRAM_ID,
//     ASSOCIATED_TOKEN_PROGRAM_ID
//   );

//   const instructions = [
//     await program.methods
//       .initializeCentralPda()
//       .accounts({
//         signer: wallet.publicKey,
//         mint: MINT_ADDRESS,
//         // centralPda: centralPda,
//         // pdaTokenAccount,
//         tokenProgram: TOKEN_2022_PROGRAM_ID,
//         // associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
//         // systemProgram: SystemProgram.programId,
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

// // // LAST INITIALIZED WITH SEEDS =  "presale-central-latest-v2"

// initializeCentralPda()
//   .then(async () => {
//     console.log("Initialized Central PDA!");
//   })
//   .catch((error) => {
//     console.error("Error initializing Central PDA: ", error);
//   });

// export const initializeUser = async () => {
//   let blockhash = await connection.getLatestBlockhash();

//   const [userState] = PublicKey.findProgramAddressSync(
//     [Buffer.from("presale-user-latest-v2"), wallet.publicKey.toBuffer()],
//     PROGRAM_ID
//   );

//   const userTokenAccount = await getAssociatedTokenAddress(
//     MINT_ADDRESS,
//     wallet.publicKey,
//     false,
//     TOKEN_2022_PROGRAM_ID,
//     ASSOCIATED_TOKEN_PROGRAM_ID
//   );

//   console.log("USER TOKEN ACC: ", userTokenAccount);

//   const mintInfo = await connection.getAccountInfo(MINT_ADDRESS);
// console.log(mintInfo.owner.toBase58());

//   const instructions = [
//     await program.methods
//       .initializeUser()
//       .accounts({
//         signer: wallet.publicKey,
//         mint: MINT_ADDRESS,
//         // userState: userState,
//         // userTokenAccount: userTokenAccount,
//         tokenProgram: TOKEN_2022_PROGRAM_ID,
//         // associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
//         // systemProgram: SystemProgram.programId,
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

// // LAST INITIALIZED WITH SEEDS =  "presale-user-latest-v2"

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
//         // central_pda: centralPda,
//         // pdaTokenAccount: pdaTokenAccount,
//         // user_state: userState,
//         // userTokenAccount: userTokenAccount,
//         // tokenProgram: TOKEN_2022_PROGRAM_ID,
//         // system_program: SystemProgram.programId,
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

// export const enableDistribution = async () => {
//   let blockhash = await connection.getLatestBlockhash();

//   const [centralPda] = PublicKey.findProgramAddressSync(
//     [Buffer.from("presale-central-latest-v1")],
//     PROGRAM_ID
//   );

//   const instructions = [
//     await program.methods
//       .enableDistribution()
//       .accounts({
//         signer: wallet.publicKey,
//         // central_pda: centralPda,
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

//   const txSignature = await connection.sendTransaction(transaction, {
//     skipPreflight: true,
//   });

//   console.log("Transaction hash", txSignature);
//   console.log(`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`);
// };

// const job = new CronJob("5 * * * * *", async function () {
//   console.log("After some time, calling the ix:", new Date());

//   try {
//     await enableDistribution();
//     console.log("Enabled distribution of Central PDA!");
//   } catch (error) {
//     console.error("Error enabling distribution of Central PDA:", error);
//   } finally {
//     job.stop();
//   }
// });

// job.start();

export const distribute = async () => {
  let blockhash = await connection.getLatestBlockhash();

  const [centralPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("presale-central-latest-v2")],
    PROGRAM_ID
  );

  const [userState] = PublicKey.findProgramAddressSync(
    [Buffer.from("presale-user-latest-v2"), wallet.publicKey.toBuffer()],
    PROGRAM_ID
  );

  const pdaTokenAccount = getAssociatedTokenAddressSync(
    MINT_ADDRESS,
    centralPda,
    true,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  console.log("PDA TOKEN ACC: ", pdaTokenAccount);

  const users = await program.account.userState.all();

  let instructions: web3.TransactionInstruction[] = [];

  for (const user of users) {
    console.log("User: ", user.account);

    const userTokenAccount = getAssociatedTokenAddressSync(
      MINT_ADDRESS,
      user.account.userPubkey,
      true,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const ix = await program.methods
      .distribute()
      .accounts({
        signer: wallet.publicKey,
        mint: MINT_ADDRESS,
        pdaTokenAccount: pdaTokenAccount,
        userTokenAccount: userTokenAccount,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .instruction();

    instructions.push(ix);
  }

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

distribute()
  .then(async () => {
    console.log("Distributed Tokens Users!");
  })
  .catch((error) => {
    console.error("Error distributing tokens to users: ", error);
  });
