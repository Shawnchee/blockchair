"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import supabase from "@/utils/supabase/client";

interface Contribution {
  projectName: string;
  milestoneName: string;
  walletAddress: string;
  amount: number; // Contribution amount in ETH
}

export default function MilestoneTrackingPersonal({ walletAddress, contractAddress, contractAbi }: any) {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [totalContributed, setTotalContributed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchUserDetails() {
      try {
        const {
          data: userData,
          error: authError,
        } = await supabase.auth.getUser();
  
        if (authError || !userData?.user) {
          console.error("Error fetching authenticated user:", authError);
          return;
        }
  
        const userId = userData.user.id;
  
        // Step 2: Fetch additional user details from the `users` table
        const { data: userDetails, error: userError } = await supabase
          .from("users")
          .select("fullname, wallet_address") // Add any other fields you need
          .eq("id", userId)
          .single();
  
        if (userError || !userDetails) {
          console.error("Error fetching user details from Supabase:", userError);
          return;
        }
  
        // Step 3: Set the user details in state
        setUser({
          fullname: userDetails.fullname,
          walletAddress : userDetails.wallet_address,
        });
      } catch (error) {
        console.error("Unexpected error fetching user details:", error);
      }
    }
  
    fetchUserDetails();
  }, []);



  useEffect(() => {
    const fetchContributions = async () => {
      if (!walletAddress || !contractAddress || !contractAbi) {
        setLoading(false);
        return;
      }

      try {
        const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/139d352315cd4c96ab2c5ec31db8c776");
        const contract = new ethers.Contract(contractAddress, contractAbi, provider);

        // Fetch the total number of milestones
        const milestonesCount = await contract.getMilestonesCount();
        const userContributions: Contribution[] = [];
        let total = 0;

        // Fetch project details from Supabase
        const { data: projects, error: supabaseError } = await supabase.from("projects").select("id, name, wallet_address");
        if (supabaseError) {
          console.error("Error fetching projects from Supabase:", supabaseError);
          return;
        }



        // Loop through each milestone to check user contributions
        for (let i = 0; i < milestonesCount; i++) {
          const milestone = await contract.getMilestone(i);
          const milestoneName = milestone[1]; // Milestone name
          const projectWallet = milestone[2]; // Wallet address associated with the milestone
          const amountContributed = await contract.getUserContribution(walletAddress, i); // Fetch user's contribution to this milestone

          if (amountContributed > 0) {
            const amountInEth = Number(ethers.formatEther(amountContributed));
            total += amountInEth;

            // Match the project from Supabase
            const project = projects.find((p: any) => p.wallet_address.toLowerCase() === projectWallet.toLowerCase());
            const projectName = project ? project.name : "Unknown Project";

            userContributions.push({
              projectName,
              milestoneName,
              walletAddress: projectWallet,
              amount: amountInEth,
            });
          }
        }

        setContributions(userContributions);
        setTotalContributed(total);
      } catch (error) {
        console.error("Error fetching contributions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [walletAddress, contractAddress, contractAbi]);

  if (loading) {
    return <div>Loading your contributions...</div>;
  }


  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="mb-4">
          {user && (
            <div className="mb-4">
              <p className="text-lg font-medium">  
                <span className="font-bold">Full Name:</span> {user.fullname}
              </p>
              <p className="text-lg font-medium">
                <span className="font-bold">Wallet Address:</span> {user.walletAddress}
              </p>
            </div>
          )}
        </div>
        <CardTitle className="text-xl font-bold">Your Contribution Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-lg font-medium">
            Total Contributed: <span className="text-green-600">{totalContributed.toFixed(4)} ETH</span>
          </p>
        </div>
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Milestone Name</TableHead>
              <TableHead>Wallet Address</TableHead>
              <TableHead className="text-right">Amount (ETH)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contributions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No contributions found.
                </TableCell>
              </TableRow>
            ) : (
              contributions.map((contribution, index) => (
                <TableRow key={index}>
                  <TableCell>{contribution.projectName}</TableCell>
                  <TableCell>{contribution.milestoneName}</TableCell>
                  <TableCell>{contribution.walletAddress}</TableCell>
                  <TableCell className="text-right">{contribution.amount.toFixed(4)} ETH</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}