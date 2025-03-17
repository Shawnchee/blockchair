"use client";

import React, { useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";

const SOLANA_RPC_URL = "https://api.devnet.solana.com"; // Change if using mainnet

export default function WalletChecker() {
    const [walletAddress, setWalletAddress] = useState("");
    const [transactions, setTransactions] = useState([]);
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const [credibilityScore, setCredibilityScore] = useState(null);
    const [analysisComments, setAnalysisComments] = useState<string[]>([]);

    const fetchTransactions = async () => {
        if (!walletAddress) {
            setStatus("❌ Please enter a Solana address.");
            return;
        }

        try {
            setLoading(true);
            setStatus("");
            setTransactions([]);
            setCredibilityScore(null);
            setAnalysisComments([]);

            const connection = new Connection(SOLANA_RPC_URL);
            const publicKey = new PublicKey(walletAddress);

            // Fetch latest 10 transactions
            const confirmedSignatures = await connection.getSignaturesForAddress(publicKey, { limit: 10 });

            if (!confirmedSignatures || confirmedSignatures.length === 0) {
                setStatus("No recent transactions found.");
                setLoading(false);
                return;
            }

            // Fetch transaction details
            const transactionsDetails = await Promise.all(
                confirmedSignatures.map(async (tx) => {
                    const txDetails = await connection.getTransaction(tx.signature, { commitment: "confirmed" });

                    if (!txDetails || !txDetails.meta || !txDetails.transaction) return null;

                    const accountIndex = txDetails.transaction.message.accountKeys.findIndex(
                        (key) => key.toBase58() === walletAddress
                    );

                    if (accountIndex === -1) return null; // Skip if wallet isn't involved

                    const preBalance = txDetails.meta.preBalances[accountIndex];
                    const postBalance = txDetails.meta.postBalances[accountIndex];
                    const amountTransferred = (postBalance - preBalance) / 1e9; // Convert lamports to SOL

                    return {
                        signature: tx.signature,
                        date: new Date(tx.blockTime * 1000).toLocaleString(),
                        amount: amountTransferred,
                    };
                })
            );

            const filteredTransactions = transactionsDetails.filter(Boolean);
            setTransactions(filteredTransactions);

            // Send transactions to backend for LLM analysis
            analyzeTransactionsWithLLM(filteredTransactions);

            setLoading(false);
        } catch (error) {
            console.error("Error fetching transactions:", error);
            setStatus("❌ Failed to fetch transactions. Please try again.");
            setLoading(false);
        }
    };

    const analyzeTransactionsWithLLM = async (transactions) => {
        if (!transactions.length) {
            setStatus("No transactions to analyze.");
            return;
        }
    
        try {
            const response = await fetch("/api/analyzeTransactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transactions }),
            });
    
            const data = await response.json();
            
            // ✅ Debugging logs
            console.log("API Response:", data);
    
            if (data.error) {
                setStatus("❌ Failed to analyze transactions.");
                return;
            }
    
            setCredibilityScore(data.score);
            setAnalysisComments(data.comments);
        } catch (error) {
            console.error("LLM analysis error:", error);
            setStatus("❌ Failed to analyze transactions.");
        }
    };
    

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Solana Wallet Security Check</h1>
            <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter Solana Wallet Address"
                className="border p-2 w-full mb-4"
            />
            <button
                onClick={fetchTransactions}
                className="bg-blue-500 text-white px-4 py-2 rounded"
                disabled={loading}
            >
                {loading ? "Checking..." : "Check Wallet"}
            </button>
            {status && <p className="mt-4">{status}</p>}

            {transactions.length > 0 && (
                <div className="mt-4">
                    <h2 className="text-xl font-bold">Recent Transactions</h2>
                    <table className="w-full border-collapse border border-gray-300 mt-2">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border p-2">Date</th>
                                <th className="border p-2">Amount (SOL)</th>
                                <th className="border p-2">Signature</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx, index) => (
                                <tr key={index} className="border">
                                    <td className="border p-2">{tx.date}</td>
                                    <td className={`border p-2 ${tx.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                                        {tx.amount.toFixed(6)} SOL
                                    </td>
                                    <td className="border p-2 truncate">{tx.signature.substring(0, 10)}...</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {credibilityScore !== null && (
                <div className="mt-4">
                    <h2 className="text-xl font-bold">Security Analysis</h2>
                    <p className="text-lg">🛡️ Credibility Score: <strong>{credibilityScore}/100</strong></p>
                    <ul className="list-disc ml-5">
                        {Array.isArray(analysisComments) && analysisComments.length > 0 ? (
                            analysisComments.map((comment, index) => (
                                <li key={index}>{comment}</li>
                            ))
                        ) : (
                            <li>No analysis comments available.</li>
                        )}
                    </ul>

                </div>
            )}
        </div>
    );
}
