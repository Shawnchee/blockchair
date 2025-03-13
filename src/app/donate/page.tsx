"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import {
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
    Connection,
    clusterApiUrl,
} from "@solana/web3.js";
import { useState } from "react";

export default function DonatePage() {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const { publicKey, sendTransaction } = useWallet();
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleDonate = async () => {
        if (!publicKey) {
            setMessage("❌ Please connect your wallet first.");
            return;
        }
    
        if (!recipient) {
            setMessage("❌ Please enter a valid recipient address.");
            return;
        }
    
        try {
            setLoading(true);
            setMessage("");
    
            // ✅ Validate recipient address
            const recipientPublicKey = new PublicKey(recipient);
    
            // ✅ Validate and convert amount
            const amountInLamports = parseFloat(amount) * LAMPORTS_PER_SOL;
            if (isNaN(amountInLamports) || amountInLamports <= 0) {
                throw new Error("Invalid amount entered.");
            }
    
            // ✅ Check wallet balance
            const balance = await connection.getBalance(publicKey);
            console.log("Wallet Balance (SOL):", balance / LAMPORTS_PER_SOL);
    
            if (balance < amountInLamports) {
                throw new Error("Insufficient funds! You may need more SOL for transaction fees.");
            }
    
            // ✅ Get latest blockhash for transaction
            const { blockhash } = await connection.getLatestBlockhash();
            console.log("Latest Blockhash:", blockhash);
    
            // ✅ Create transaction and explicitly set fee payer
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: recipientPublicKey,
                    lamports: amountInLamports,
                })
            );
    
            transaction.feePayer = publicKey;
            transaction.recentBlockhash = blockhash;
    
            // ✅ Estimate transaction fee before sending
            const feeEstimate = await connection.getFeeForMessage(transaction.compileMessage());
            const estimatedFee = feeEstimate.value ?? 0; // Use 0 if fee estimate is null
    
            console.log("Estimated Transaction Fee (SOL):", estimatedFee / LAMPORTS_PER_SOL);
    
            // ✅ Ensure enough balance for transaction fee
            if (balance < amountInLamports + estimatedFee) {
                throw new Error("Insufficient funds after transaction fees! Try a smaller amount.");
            }
    
            // ✅ Send transaction
            const signature = await sendTransaction(transaction, connection);
            setMessage(
                `✅ Donation successful! [View Transaction](https://explorer.solana.com/tx/${signature}?cluster=devnet)`
            );
        } catch (error) {
            console.error("Transaction error:", error);
            setMessage(`❌ Transaction failed: ${(error as Error).message}`);
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Donate with Solana</h1>
            <p>Your donations help support our cause. Thank you!</p>

            <input
                type="text"
                placeholder="Enter recipient address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                style={{ width: "80%", padding: "10px", margin: "10px" }}
            />
            <input
                type="number"
                placeholder="Enter amount (SOL)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: "80%", padding: "10px", margin: "10px" }}
            />

            <button
                onClick={handleDonate}
                disabled={loading}
                style={{ padding: "10px 20px", fontSize: "16px" }}
            >
                {loading ? "Processing..." : `Donate ${amount || "0"} SOL`}
            </button>

            {message && <p style={{ marginTop: "20px", color: "green" }}>{message}</p>}
        </div>
    );
}
