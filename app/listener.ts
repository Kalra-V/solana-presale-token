import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import idl from "./idl/solana_presale_token.json";
import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import fs from "fs";
import { SolanaPresaleToken } from "../target/types/solana_presale_token";
import dotenv from "dotenv";
import { writeEvent } from "./eventStore";
import { emitEvent, setSocketIOInstance } from "./socket-emitter";
import { createServer } from "http";
import { Server } from "socket.io";
dotenv.config();

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const SOCKET_PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(SOCKET_PORT, () => {
  console.log(`Socket.IO server listening on port ${SOCKET_PORT}`);
});

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
  process.exit(1);
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

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

setSocketIOInstance(io);

async function handleEvent(
  eventName: string,
  eventType: string,
  event: any,
  slot: number,
  signature: string,
  dataMapper: (event: any) => any
) {
  try {
    const eventData = dataMapper(event);

    // Try to write to DB
    const result = await writeEvent(
      {
        eventType,
        txSignature: signature,
        slot,
        timestamp: new Date().toISOString(),
      },
      eventData
    );

    // Handle duplicate events
    if (result.isDuplicate) {
      console.log(`Duplicate ${eventType} event detected (tx: ${signature.slice(0, 8)}...), skipping`);
      return;
    }

    // Only emit to frontend if DB write was successful
    emitEvent(eventName, {
      ...eventData,
      eventType,
      txSignature: signature,
      slot,
      timestamp: new Date().toISOString(),
    });

    console.log(`${eventType} event processed successfully (tx: ${signature.slice(0, 8)}...)`);
  } catch (error: any) {
    // Log the error but don't crash the listener
    console.error(`Error processing ${eventType} event:`, {
      error: error.message,
      txSignature: signature,
      slot,
    });

    // Optional: Emit error event for monitoring/alerting
    emitEvent("event_processing_error", {
      eventType,
      txSignature: signature,
      slot,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

program.addEventListener("depositEvent", async (event, slot, signature) => {
  console.log("Got event DEPOSIT:", event, "slot:", slot, "sig:", signature);

  await handleEvent(
    "deposit",
    "DEPOSIT",
    event,
    slot,
    signature,
    (e) => ({
      user_pubkey: e.userPubkey.toString(),
      lamports: Number(e.amount),
      central_pda: e.centralPda.toString(),
    })
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

    await handleEvent(
      "initialize_user",
      "INITIALIZE_USER",
      event,
      slot,
      signature,
      (e) => ({
        user_pubkey: e.userPubkey.toString(),
        user_state_pda: e.userStatePda.toString(),
      })
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

    await handleEvent(
      "initialize_central_pda",
      "INITIALIZE_CENTRAL_PDA",
      event,
      slot,
      signature,
      (e) => ({
        central_pda: e.centralPda.toString(),
        signer: e.signer.toString(),
        mint: e.mint.toString(),
      })
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

    await handleEvent(
      "enable_distribution",
      "ENABLE_DISTRIBUTION",
      event,
      slot,
      signature,
      (e) => ({
        central_pda: e.centralPda.toString(),
        signer: e.signer.toString(),
      })
    );
  }
);

program.addEventListener("distributeEvent", async (event, slot, signature) => {
  console.log("Got event DISTRIBUTE:", event, "slot:", slot, "sig:", signature);

  await handleEvent(
    "distribute",
    "DISTRIBUTE",
    event,
    slot,
    signature,
    (e) => ({
      user_pubkey: e.userPubkey.toString(),
      user_state_pda: e.userState.toString(),
      token_amount: Number(e.tokenAmount),
      mint: e.mint.toString(),
      signer: e.signer.toString(),
    })
  );
});

console.log("Listener started successfully");
console.log("Listening for Solana events on devnet...");
console.log("WebSocket server ready on port", SOCKET_PORT);