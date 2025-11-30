import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { Deposit } from "../target/types/deposit";
import { assert } from "chai";
import { PublicKey } from "@solana/web3.js";

describe("deposit program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Deposit as Program<Deposit>;

  let vaultPda: PublicKey;
  let vaultBump: number;

  it("Initializes the vault PDA", async () => {
    // Derive PDA for the vault
    [vaultPda, vaultBump] = await PublicKey.findProgramAddress(
      [Buffer.from("vault"), provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    // Call initVault — only pass `user`; Anchor injects systemProgram and derives vault PDA
    await program.methods
      .initVault()
      .accounts({
        user: provider.wallet.publicKey,
      })
      .rpc();

    // Fetch PDA data
    const vaultAccount = await program.account.vault.fetch(vaultPda);

    // Assertions
    assert.equal(vaultAccount.owner.toBase58(), provider.wallet.publicKey.toBase58());
    assert.equal(vaultAccount.bump, vaultBump);

    console.log("Vault initialized at PDA:", vaultPda.toBase58());
  });

  it("Deposits lamports into the vault", async () => {
    const depositAmount = new BN(1_000_000); // 0.001 SOL

    // Balance before deposit
    const balanceBefore = await provider.connection.getBalance(vaultPda);

    // Deposit lamports — only pass user; Anchor derives vault PDA automatically
    await program.methods
      .deposit(depositAmount)
      .accounts({
        user: provider.wallet.publicKey,
      })
      .rpc();

    // Balance after deposit
    const balanceAfter = await provider.connection.getBalance(vaultPda);

    // Assertion
    assert.equal(balanceAfter - balanceBefore, depositAmount.toNumber());
    console.log(`Deposited ${depositAmount.toNumber()} lamports successfully.`);
  });
});
