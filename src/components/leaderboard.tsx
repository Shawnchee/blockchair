"use client";

import { useEffect, useState } from "react";
import supabase from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface LeaderboardEntry {
  fullname: string;
  amount_eth_donated: number;
  wallet_address: string;
}

// Utility function to truncate wallet addresses
const truncateAddress = (address: string, startLength = 6, endLength = 4) => {
  if (!address) return "N/A";
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("fullname, amount_eth_donated, wallet_address")
          .order("amount_eth_donated", { ascending: false }) // Sort by most donated
          .limit(10); // Limit to top 10 donors

        if (error) {
          console.error("Error fetching leaderboard:", error);
          return;
        }

        setLeaderboard(data || []);
      } catch (error) {
        console.error("Unexpected error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return <div>Loading leaderboard...</div>;
  }

  return (
    <Card className="w-full max-w-7xl  mx-auto mb-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Top Donors Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <p className="text-center text-gray-500">No donations have been made yet.</p>
        ) : (
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Rank</TableHead>
                <TableHead className="text-left">Full Name</TableHead>
                <TableHead className="text-left">Wallet Address</TableHead>
                <TableHead className="text-right">Total Donated (ETH)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((entry, index) => (
                <TableRow key={index} className="hover:bg-gray-100">
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{entry.fullname}</TableCell>
                  <TableCell>{truncateAddress(entry.wallet_address)}</TableCell>
                  <TableCell className="text-right">{entry.amount_eth_donated.toFixed(4)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}