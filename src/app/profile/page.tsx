"use client"

import Leaderboard from "@/components/leaderboard";
import MilestoneTrackingPersonal from "@/components/profile/milestone-tracking-personal";
import WalletTransaction from "@/components/profile/walletTransaction";
import supabase from "@/utils/supabase/client";
import { useEffect, useState } from "react";

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
        <WalletTransaction walletAddress={walletAddress}/>
        <Leaderboard/>
        </div>
    )
}