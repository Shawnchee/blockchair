"use client";

import { useEffect, useState } from "react";
import supabase from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Loader2 } from "lucide-react";

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

  // Medal colors for top 3 positions
  const getMedalColor = (index: number) => {
    switch (index) {
      case 0: return "text-yellow-500"; // Gold
      case 1: return "text-gray-400";   // Silver
      case 2: return "text-amber-700";  // Bronze
      default: return "text-gray-300";  // Others
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg font-medium text-gray-600">Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-7xl mx-auto mb-8 shadow-lg border-t-4 border-t-primary">
      <CardHeader className="bg-gray-50">
        <div className="flex items-center justify-center gap-3">
          <Trophy className="h-8 w-8 text-primary" />
          <CardTitle className="text-3xl font-bold text-center">Top Donors Leaderboard</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {leaderboard.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-xl text-gray-500">No donations have been made yet.</p>
            <p className="text-sm text-gray-400 mt-2">Be the first to contribute and claim the top spot!</p>
          </div>
        ) : (
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-left font-bold">Rank</TableHead>
                <TableHead className="text-left font-bold">Full Name</TableHead>
                <TableHead className="text-left font-bold">Wallet Address</TableHead>
                <TableHead className="text-right font-bold">Total Donated (ETH)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((entry, index) => (
                <TableRow 
                  key={index} 
                  className={`hover:bg-gray-50 ${index < 3 ? 'bg-opacity-10' : ''}`}
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <div className={`font-bold text-lg ${getMedalColor(index)}`}>
                        {index + 1}
                      </div>
                      {index < 3 && (
                        <Trophy className={`h-5 w-5 ${getMedalColor(index)}`} />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{entry.fullname}</TableCell>
                  <TableCell className="font-mono text-sm">{truncateAddress(entry.wallet_address)}</TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    {entry.amount_eth_donated.toFixed(4)} ETH
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}