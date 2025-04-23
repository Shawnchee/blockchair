"use client"

import Leaderboard from "@/components/leaderboard";
import MilestoneTrackingPersonal from "@/components/profile/milestone-tracking-personal";
import WalletTransaction from "@/components/profile/walletTransaction";
import DonationReport from "@/components/profile/DonationReport";
import supabase from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function profilePage(){
    const [walletAddress,setwalletAddress] = useState<any>(null);
    // getting their wallet address from supabase
    useEffect(() => {
        async function fetchUserDetails() {
            try {
                const { data: userData, error: authError } = await supabase.auth.getUser();
                if (authError || !userData?.user) {
                    console.error("Error fetching authenticated user:", authError);
                    return;
                }
                const userId = userData.user.id;
                const { data: userDetails, error: userError } = await supabase
                    .from("users")
                    .select("wallet_address")
                    .eq("id", userId)
                    .single();
                if (userError || !userDetails) {
                    console.error("Error fetching user details from Supabase:", userError);
                    return;
                }
                setwalletAddress(userDetails.wallet_address);
            } catch (error) {
                console.error("Unexpected error fetching user details:", error);
            }
        }
        fetchUserDetails();
    }, []);


    return (
        <div className="min-h-screen pt-24">
            <MilestoneTrackingPersonal/>

            <Tabs defaultValue="transactions" className="w-full max-w-7xl mx-auto mt-8">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="transactions">Transaction History</TabsTrigger>
                    <TabsTrigger value="donations">Donation Report</TabsTrigger>
                </TabsList>
                <TabsContent value="transactions">
                    <WalletTransaction walletAddress={walletAddress}/>
                </TabsContent>
                <TabsContent value="donations">
                    <DonationReport walletAddress={walletAddress}/>
                </TabsContent>
            </Tabs>

            <Leaderboard/>
        </div>
    )
}