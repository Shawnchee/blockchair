"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

interface Donation {
    id: string;
    title: string;
    description: string;
    cover_image: string;
    total_amount: number;
    contract_address?: string; // Optional if not all have contracts
  }
  
  interface Milestone {
    id: string;
    charity_id: string;
    milestone_name: string;
    target_amount: number;
    funds_raised: number;
    status: "pending" | "completed";
  }
  
  interface Transaction {
    id: string;
    charity_id: string;
    amount: number;
    donor_name?: string;
    timestamp: string;
    tx_hash?: string;
  }

const DonationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [donation, setDonation] = useState<Donation | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: donationData, error: donationError } = await supabase
        .from("charity_2")
        .select("*")
        .eq("id", id)
        .single();

      const { data: milestonesData, error: milestonesError } = await supabase
        .from("milestone")
        .select("*")
        .eq("charity_2_id", id);

      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transaction_history")
        .select("*")
        .eq("charity_id", id);

      if (donationError) console.error("Donation fetch error:", donationError);
      if (milestonesError) console.error("Milestone fetch error:", milestonesError);
      if (transactionsError) console.error("Transaction fetch error:", transactionsError);

      setDonation(donationData as Donation);
      setMilestones(milestonesData || []);
      setTransactions(transactionsData || []);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!donation) return <p>Donation not found.</p>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold">{donation.title}</h1>
      <img src={donation.cover_image} alt={donation.title} className="w-full h-80 object-cover mt-4 rounded-lg" />
      <p className="mt-4 text-gray-600">{donation.description}</p>
      <p className="mt-2 text-green-600 font-bold text-xl">
        ${donation.total_amount.toLocaleString()} raised
      </p>

      {/* Milestones Section */}
      <h2 className="text-2xl font-bold mt-6">Milestones</h2>
      {milestones.length > 0 ? (
        <div className="mt-2 space-y-4">
          {milestones.map((milestone) => (
            <div key={milestone.id} className="p-4 bg-gray-100 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg">{milestone.milestone_name}</h3>
              <p className="text-sm text-gray-500">
                Target: ${milestone.target_amount.toLocaleString()} | Raised: ${milestone.funds_raised.toLocaleString()}
              </p>
              <div className="w-full bg-gray-300 h-2 rounded-full mt-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${(milestone.funds_raised / milestone.target_amount) * 100}%`,
                  }}
                ></div>
              </div>
              <p className={`mt-2 font-semibold ${milestone.status === "completed" ? "text-green-600" : "text-yellow-600"}`}>
                Status: {milestone.status}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No milestones yet.</p>
      )}

      {/* Transactions Section */}
      <h2 className="text-2xl font-bold mt-6">Transaction History</h2>
      {transactions.length > 0 ? (
        <table className="min-w-full bg-white border border-gray-200 mt-2 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Amount</th>
              <th className="py-2 px-4 border-b text-left">Donor</th>
              <th className="py-2 px-4 border-b text-left">Date</th>
              <th className="py-2 px-4 border-b text-left">Transaction Hash</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b">
                <td className="py-2 px-4">${tx.amount.toLocaleString()}</td>
                <td className="py-2 px-4">{tx.donor_name || "Anonymous"}</td>
                <td className="py-2 px-4">{new Date(tx.timestamp).toLocaleDateString()}</td>
                <td className="py-2 px-4 text-blue-500 truncate">
                  {tx.tx_hash ? (
                    <a href={`https://solscan.io/tx/${tx.tx_hash}`} target="_blank" rel="noopener noreferrer">
                      {tx.tx_hash.substring(0, 10)}...
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500">No transactions yet.</p>
      )}
    </div>
  );
};

export default DonationDetails;
