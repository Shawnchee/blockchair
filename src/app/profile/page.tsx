"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";

export default function SolanaBalancePage() {
    const [balance, setBalance] = useState<number | null>(null);
    const { publicKey, connected } = useWallet();
    
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    useEffect(() => {
        const fetchBalance = async () => {
            if (publicKey) {
                try {
                    const balanceLamports = await connection.getBalance(publicKey);
                    setBalance(balanceLamports / LAMPORTS_PER_SOL); // Convert lamports to SOL
                } catch (error) {
                    console.error("Error fetching balance:", error);
                    setBalance(null);
                }
            }
        };

        if (connected) {
            fetchBalance();
        }
    }, [publicKey, connected]);

    return (
        <div className="p-8 max-w-lg mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Phantom Wallet Balance</h1>
            {connected && publicKey ? (
                <div className="p-4 border rounded-lg shadow-lg">
                    <p><strong>Address:</strong> {publicKey.toBase58()}</p>
                    <p><strong>Balance:</strong> {balance !== null ? `${balance.toFixed(4)} SOL` : "Loading..."}</p>
                </div>
            ) : (
                <p className="text-red-500">Please connect your Phantom wallet.</p>
            )}
        </div>
    );
}
