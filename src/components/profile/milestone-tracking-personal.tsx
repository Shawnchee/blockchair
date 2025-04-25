"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Award,
  Wallet,
  Calendar,
  TrendingUp,
  PawPrint,
  Tickets,
} from "lucide-react";
import supabase from "@/utils/supabase/client";
import PetStats from "@/components/pets/pet-stats";

interface Contribution {
  projectName: string;
  milestoneName: string;
  walletAddress: string;
  amount: number; // Contribution amount in ETH
}

const defaultVouchers = [
  {
    id: 1,
    name: "Zus B1F1",
    expiryDate: "2025-12-31",
    code: "COFFEE123",
  },
  {
    id: 2,
    name: "Padini 20% Off",
    expiryDate: "2026-01-15",
    code: "PADINI20",
  },
  {
    id: 3,
    name: "Mixue RM3 Off",
    expiryDate: "2026-02-28",
    code: "MIXUE3OFF",
  },
];

export default function MilestoneTrackingPersonal({
  walletAddress,
  contractAddress,
  contractAbi,
}: any) {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]); // Assuming vouchers are fetched from Supabase
  const [totalContributed, setTotalContributed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchUserDetails() {
      try {
        const { data: userData, error: authError } =
          await supabase.auth.getUser();

        if (authError || !userData?.user) {
          console.error("Error fetching authenticated user:", authError);
          return;
        }

        const userId = userData.user.id;

        // Step 2: Fetch additional user details from the `users` table
        const { data: userDetails, error: userError } = await supabase
          .from("users")
          .select("fullname, wallet_address, amount_eth_donated") // Add any other fields you need
          .eq("id", userId)
          .single();

        if (userError || !userDetails) {
          console.error(
            "Error fetching user details from Supabase:",
            userError
          );
          return;
        }

        // Step 3: Set the user details in state
        setUser({
          fullname: userDetails.fullname,
          walletAddress: userDetails.wallet_address,
          amountEthDonated: userDetails.amount_eth_donated,
        });
      } catch (error) {
        console.error("Unexpected error fetching user details:", error);
      }
    }

    fetchUserDetails();
    setVouchers(defaultVouchers); // Set default vouchers
  }, []);

  useEffect(() => {
    const fetchContributions = async () => {
      if (!walletAddress || !contractAddress || !contractAbi) {
        setLoading(false);
        return;
      }

      try {
        const provider = new ethers.JsonRpcProvider(
          "https://sepolia.infura.io/v3/139d352315cd4c96ab2c5ec31db8c776"
        );
        const contract = new ethers.Contract(
          contractAddress,
          contractAbi,
          provider
        );

        // Fetch the total number of milestones
        const milestonesCount = await contract.getMilestonesCount();
        const userContributions: Contribution[] = [];
        let total = 0;

        // Fetch project details from Supabase
        const { data: projects, error: supabaseError } = await supabase
          .from("projects")
          .select("id, name, wallet_address");
        if (supabaseError) {
          console.error(
            "Error fetching projects from Supabase:",
            supabaseError
          );
          return;
        }

        // Loop through each milestone to check user contributions
        for (let i = 0; i < milestonesCount; i++) {
          const milestone = await contract.getMilestone(i);
          const milestoneName = milestone[1]; // Milestone name
          const projectWallet = milestone[2]; // Wallet address associated with the milestone
          const amountContributed = await contract.getUserContribution(
            walletAddress,
            i
          ); // Fetch user's contribution to this milestone

          if (amountContributed > 0) {
            const amountInEth = Number(ethers.formatEther(amountContributed));
            total += amountInEth;

            // Match the project from Supabase
            const project = projects.find(
              (p: any) =>
                p.wallet_address.toLowerCase() === projectWallet.toLowerCase()
            );
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
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Calculate donor level based on amount donated
  const getDonorLevel = (amount: number) => {
    if (amount >= 10)
      return {
        level: "Platinum",
        color: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white",
      };
    if (amount >= 5)
      return {
        level: "Gold",
        color: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white",
      };
    if (amount >= 1)
      return {
        level: "Silver",
        color: "bg-gradient-to-r from-gray-300 to-gray-500 text-white",
      };
    return {
      level: "Bronze",
      color: "bg-gradient-to-r from-amber-700 to-amber-900 text-white",
    };
  };

  // Get next level threshold
  const getNextLevelThreshold = (amount: number) => {
    if (amount >= 10)
      return { next: "Diamond", threshold: 20, progress: (amount / 20) * 100 };
    if (amount >= 5)
      return { next: "Platinum", threshold: 10, progress: (amount / 10) * 100 };
    if (amount >= 1)
      return { next: "Gold", threshold: 5, progress: (amount / 5) * 100 };
    return { next: "Silver", threshold: 1, progress: amount * 100 };
  };

  const donorLevel = user?.amountEthDonated
    ? getDonorLevel(user.amountEthDonated)
    : getDonorLevel(0);
  const nextLevel = user?.amountEthDonated
    ? getNextLevelThreshold(user.amountEthDonated)
    : getNextLevelThreshold(0);

  // Format date for "donor since"
  const donorSince = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-teal-800">
              {user?.fullname || "Donor Profile"}
            </CardTitle>
            <CardDescription className="mt-1">
              <span className="font-mono text-xs break-all">
                {user?.walletAddress}
              </span>
            </CardDescription>
          </div>
          <Badge
            className={`${donorLevel.color} px-3 py-1.5 text-sm font-medium`}
          >
            {donorLevel.level} Donor
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-teal-50 rounded-lg p-4 border border-teal-100 flex flex-col">
            <div className="flex items-center text-teal-700 mb-1">
              <Wallet className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Total Donated</span>
            </div>
            <div className="mt-1">
              <span className="text-2xl font-bold text-teal-800">
                {user?.amountEthDonated || 0} ETH
              </span>
              <p className="text-xs text-teal-600 mt-1">
                ≈ {((user?.amountEthDonated || 0) * 12500).toLocaleString()} MYR
              </p>
            </div>
          </div>

          <div className="bg-teal-50 rounded-lg p-4 border border-teal-100 flex flex-col">
            <div className="flex items-center text-teal-700 mb-1">
              <Award className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Next Level</span>
            </div>
            <div className="mt-1">
              <span className="text-lg font-medium text-teal-800">
                {nextLevel.next} Donor
              </span>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs text-teal-700">
                  <span>{user?.amountEthDonated || 0} ETH</span>
                  <span>{nextLevel.threshold} ETH</span>
                </div>
                <Progress value={nextLevel.progress} className="h-2" />
                <p className="text-xs text-teal-600">
                  {(
                    nextLevel.threshold - (user?.amountEthDonated || 0)
                  ).toFixed(2)}{" "}
                  ETH to reach {nextLevel.next}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-teal-50 rounded-lg p-4 border border-teal-100 flex flex-col">
            <div className="flex items-center text-teal-700 mb-1">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Donor Since</span>
            </div>
            <div className="mt-1">
              <span className="text-lg font-medium text-teal-800">
                {donorSince}
              </span>
              <p className="text-xs text-teal-600 mt-1">
                Thank you for your continued support!
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-teal-100 overflow-hidden mb-6">
          <div className="p-4 bg-teal-50 border-b border-teal-100 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-teal-700" />
            <h3 className="font-medium text-teal-800">Recent Contributions</h3>
          </div>

          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-teal-50/50">
                <TableHead>Project Name</TableHead>
                <TableHead>Milestone</TableHead>
                <TableHead className="hidden md:table-cell">
                  Wallet Address
                </TableHead>
                <TableHead className="text-right">Amount (ETH)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contributions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-teal-700"
                  >
                    No contributions found. Start donating to track your impact!
                  </TableCell>
                </TableRow>
              ) : (
                contributions.map((contribution, index) => (
                  <TableRow key={index} className="hover:bg-teal-50/30">
                    <TableCell className="font-medium">
                      {contribution.projectName}
                    </TableCell>
                    <TableCell>{contribution.milestoneName}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="font-mono text-xs">
                        {contribution.walletAddress.substring(0, 10)}...
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium text-teal-700">
                      {contribution.amount.toFixed(4)} ETH
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-teal-50 rounded-lg p-4 border border-teal-100 flex flex-col">
            <div className="flex items-center text-teal-700 mb-1">
              <PawPrint className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">My Pet</span>
            </div>
            <div className="mt-1 flex items-center">
              <div
                className={`relative w-[150px] h-[150px] rounded-xl overflow-hidden flex items-center justify-center mb-6 mr-4`} // Added mr-4 for spacing
                style={{
                  backgroundImage: `url(https://jalcuslxbhoxepybolxw.supabase.co/storage/v1/object/public/virtual-pets/background/space.png)`,
                  backgroundPosition: "0px -300px",
                }}
              >
                <div className="relative w-[150px] h-[150px] cursor-pointer transform transition-transform hover:scale-110 active:scale-95">
                  <Image
                    src="https://jalcuslxbhoxepybolxw.supabase.co/storage/v1/object/public/virtual-pets/pet-combined/somen-petto.png"
                    alt="The Magical Panda ✨"
                    width={400}
                    height={400}
                    className="object-contain"
                  />
                </div>
              </div>
              {/* Stats will go here */}
              <div className="flex flex-col justify-center ml-3 w-80">
                <PetStats />
              </div>
            </div>
          </div>
          <div className="bg-teal-50 rounded-lg p-4 border border-teal-100 flex flex-col">
            <div className="flex items-center text-teal-700 mb-1">
              <Tickets className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Rewards</span>
            </div>
            <div className="mt-1">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-teal-50/50">
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Expiry Date
                    </TableHead>
                    <TableHead className="text-right">Code</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vouchers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-teal-700"
                      >
                        No rewards found. Start donating to earn rewards!
                      </TableCell>
                    </TableRow>
                  ) : (
                    vouchers.map((voucher, index) => (
                      <TableRow key={index} className="hover:bg-teal-50/30">
                        <TableCell className="font-medium">
                          {voucher.name}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="font-mono text-xs">
                            {voucher.expiryDate}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium text-teal-700">
                          {voucher.code}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
