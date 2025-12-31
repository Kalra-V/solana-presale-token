import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import idl from "./idl/solana_presale_token.json";
import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import fs from "fs";
import { SolanaPresaleToken } from "../target/types/solana_presale_token";
import dotenv from "dotenv";
import { writeEvent } from "./eventStore";
dotenv.config();

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

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

program.addEventListener("depositEvent", async (event, slot, signature) => {
  console.log("Got event DEPOSIT:", event, "slot:", slot, "sig:", signature);

  await writeEvent(
    {
      eventType: "DEPOSIT",
      txSignature: signature,
      slot,
      timestamp: new Date().toISOString(),
    },
    {
      user_pubkey: event.userPubkey.toString(),
      lamports: Number(event.amount),
      central_pda: event.centralPda.toString(),
    }
  );
});

program.addEventListener(
  "initializeUserEvent",
  async (event, slot, signature) => {
    console.log(
      "Got event INITIALIZE_USER:",
      event,
      "slot:",
      slot,
      "sig:",
      signature
    );

    await writeEvent(
      {
        eventType: "INITIALIZE_USER",
        txSignature: signature,
        slot,
        timestamp: new Date().toISOString(),
      },
      {
        user_pubkey: event.userPubkey.toString(),
        user_state_pda: event.userStatePda.toString(),
      }
    );
  }
);

program.addEventListener(
  "initializeCentralPdaEvent",
  async (event, slot, signature) => {
    console.log(
      "Got event INITIALIZE_CENTRAL_PDA:",
      event,
      "slot:",
      slot,
      "sig:",
      signature
    );

    await writeEvent(
      {
        eventType: "INITIALIZE_CENTRAL_PDA",
        txSignature: signature,
        slot,
        timestamp: new Date().toISOString(),
      },
      {
        central_pda: event.centralPda.toString(),
        signer: event.signer.toString(),
        mint: event.mint.toString(),
      }
    );
  }
);

program.addEventListener(
  "enableDistributionEvent",
  async (event, slot, signature) => {
    console.log(
      "Got event ENABLE_DISTRIBUTION:",
      event,
      "slot:",
      slot,
      "sig:",
      signature
    );

    await writeEvent(
      {
        eventType: "ENABLE_DISTRIBUTION",
        txSignature: signature,
        slot,
        timestamp: new Date().toISOString(),
      },
      {
        central_pda: event.centralPda.toString(),
        signer: event.signer.toString(),
      }
    );
  }
);

program.addEventListener("distributeEvent", async (event, slot, signature) => {
  console.log("Got event DISTRIBUTE:", event, "slot:", slot, "sig:", signature);

  await writeEvent(
    {
      eventType: "DISTRIBUTE",
      txSignature: signature,
      slot,
      timestamp: new Date().toISOString(),
    },
    {
      user_pubkey: event.userPubkey.toString(),
      user_state_pda: event.userState.toString(),
      token_amount: Number(event.tokenAmount),
      mint: event.mint.toString(),
      signer: event.signer.toString(),
    }
  );
});
