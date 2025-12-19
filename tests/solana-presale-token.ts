import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { SolanaPresaleToken } from "../target/types/solana_presale_token";

const LAMPORTS_PER_SOL = 1000000000;

describe("solana-presale-token", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace
    .solanaPresaleToken as Program<SolanaPresaleToken>;

  it("User is initialized!", async () => {
    const tx = await program.methods.initializeUser().rpc();
    console.log("Tx signature", tx);
  });

  it("Central PDA is initialized!", async () => {
    const tx = await program.methods.initializeCentralPda().rpc();
    console.log("Tx signature", tx);
  });

  it("Deposited 1 SOL to Central PDA & Updated User State!", async () => {
    const amount = 1 * LAMPORTS_PER_SOL;

    const tx = await program.methods.deposit(new BN(amount)).rpc();
    console.log("Tx signature", tx);
  });
});
