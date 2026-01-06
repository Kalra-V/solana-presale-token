import { Connection, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import type { SolanaPresaleToken } from "../solana_presale_token";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const idlPath = path.join(__dirname, "../../app/idl/solana_presale_token.json");
const idl = JSON.parse(fs.readFileSync(idlPath, "utf8"));

const PROGRAM_ID = new PublicKey("HnQPtPdUZnYQpqX14QiP1CFY9x49hUyDCaaXUjRLH1JJ");

let connection: Connection;
let program: Program<SolanaPresaleToken>;

export function initializeSolana(rpcUrl?: string) {
  if (connection && program) {
    return { connection, program };
  }

  connection = new Connection(
    rpcUrl || process.env.RPC_URL || "https://api.devnet.solana.com",
    "confirmed"
  );

  // const provider = new AnchorProvider(
  //   connection,
  //   {
  //     publicKey: PublicKey.default,
  //     signTransaction: async () => {
  //       throw new Error("Not implemented");
  //     },
  //     signAllTransactions: async () => {
  //       throw new Error("Not implemented");
  //     },
  //   } as Wallet,
  //   { commitment: "confirmed" }
  // );

  // program = new Program(idl as SolanaPresaleToken, provider);
  program = new Program(idl as SolanaPresaleToken);

  return { connection, program };
}

export async function getUserState(userPubkey: PublicKey) {
  const { program } = initializeSolana();

  const [userStatePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("presale-user-latest-v2"), userPubkey.toBuffer()],
    PROGRAM_ID
  );

  try {
    const userState = await program.account.userState.fetch(userStatePDA);
    return {
      userPubkey: userState.userPubkey.toString(),
      solTransferred: Number(userState.solTransferred),
      isDistributed: userState.isDistributed,
    };
  } catch (error) {
    return null;
  }
}

export async function getCentralPDAState() {
  const { program } = initializeSolana();

  const [centralPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("presale-central-latest-v2")],
    PROGRAM_ID
  );

  try {
    const centralPDAState = await program.account.centralPda.fetch(centralPDA);
    return {
      isDistributable: centralPDAState.isDistributable,
    };
  } catch (error) {
    return null;
  }
}

export function getProgramId(): PublicKey {
  return PROGRAM_ID;
}

