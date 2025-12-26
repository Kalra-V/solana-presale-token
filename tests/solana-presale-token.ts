import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { SolanaPresaleToken } from "../target/types/solana_presale_token";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
  getOrCreateAssociatedTokenAccount,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";

const LAMPORTS_PER_SOL = 1000000000;

const MINT_ADDRESS = new PublicKey(
  "9PW5vownEEBguqy1WEcCH55vzyLb18428RdFagq7mLfe"
);

describe("solana-presale-token", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace
    .solanaPresaleToken as Program<SolanaPresaleToken>;

  // it("User is initialized!", async () => {
  //   const tx = await program.methods
  //     .initializeUser()
  //     .accounts({
  //       mint: MINT_ADDRESS,
  //       tokenProgram: TOKEN_2022_PROGRAM_ID,
  //     })
  //     .rpc();
  //   console.log("Tx signature", tx);
  // });

  // it("Central PDA is initialized!", async () => {
  //   const tx = await program.methods
  //     .initializeCentralPda()
  //     .accounts({
  //       mint: MINT_ADDRESS,
  //       tokenProgram: TOKEN_2022_PROGRAM_ID,
  //     })
  //     .rpc();
  //   console.log("Tx signature", tx);
  // });

  it("Deposited 1 SOL to Central PDA & Updated User State!", async () => {
    const amount = 1 * LAMPORTS_PER_SOL;

    // const [centralPda] = PublicKey.findProgramAddressSync(
    //   [Buffer.from("presale-central-acc")],
    //   program.programId
    // );

    // console.log("CENTRAL PDA: ", centralPda);

    // const pdaTokenAccount = await getOrCreateAssociatedTokenAccount(
    //   anchor.getProvider().connection,
    //   anchor.getProvider().wallet.payer,
    //   MINT_ADDRESS,
    //   centralPda,
    //   true,
    //   undefined,
    //   undefined,
    //   TOKEN_2022_PROGRAM_ID,
    //   ASSOCIATED_TOKEN_PROGRAM_ID
    // );

    // console.log("PDA ATA: ", pdaTokenAccount.address);

    // const userTokenAccount = await getOrCreateAssociatedTokenAccount(
    //   anchor.getProvider().connection,
    //   anchor.getProvider().wallet.payer,
    //   MINT_ADDRESS,
    //   anchor.getProvider().publicKey,
    //   false,
    //   undefined,
    //   undefined,
    //   TOKEN_2022_PROGRAM_ID,
    //   ASSOCIATED_TOKEN_PROGRAM_ID
    // );

    // console.log("USER ATA: ", userTokenAccount.address);

    const tx = await program.methods
      .deposit(new BN(amount))
      // .accounts({
        // mint: MINT_ADDRESS,
        // tokenProgram: TOKEN_PROGRAM_ID,
        // pdaTokenAccount: pdaTokenAccount.address,
        // userTokenAccount: userTokenAccount.address,
      // })
      .rpc();
    console.log("Tx signature", tx);
  });
});
