"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useState } from "react";

export default function DonatePage() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [amount, setAmount] = useState("");
  const [charityWallet, setCharityWallet] = useState("");

  const handleDonate = async () => {
    if (!publicKey) return alert("Please connect your wallet first!");
    if (!amount || isNaN(Number(amount))) return alert("Enter a valid amount!");
    if (!charityWallet) return alert("Enter a charity wallet address!");

    try {
      const recipientPubKey = new PublicKey(charityWallet);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubKey,
          lamports: Number(amount) * 1e9, // Convert SOL to lamports
        })
      );

      const signature = await sendTransaction(transaction, connection);
      alert(`Donation sent! Tx Hash: ${signature}`);
    } catch (error) {
      console.error("Donation failed", error);
      alert("Transaction failed!");
    }
  };

  return (
    <div>
      <h1>Donate to Charity</h1>
      <p>Enter a charity wallet address and amount to donate.</p>

      {/* Input for Charity Wallet */}
      <input
        type="text"
        placeholder="Charity Wallet Address"
        value={charityWallet}
        onChange={(e) => setCharityWallet(e.target.value)}
      />

      {/* Input for Amount */}
      <input
        type="number"
        placeholder="Enter amount (SOL)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <button onClick={handleDonate}>Donate</button>
    </div>
  );
}
