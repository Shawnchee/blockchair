"use client"

import Leaderboard from "@/components/leaderboard";
import MilestoneTrackingPersonal from "@/components/profile/milestone-tracking-personal";
import WalletTransaction from "@/components/profile/walletTransaction";
import DonationReport from "@/components/profile/DonationReport";
import PersonalizedRecommendations from "@/components/profile/PersonalizedRecommendations";
import FinancialInsights from "@/components/profile/FinancialInsights";
import TaxInsights from "@/components/profile/TaxInsights";
import supabase from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCircle, ChartPieIcon, Sparkles, Calculator } from "lucide-react";
import InteractiveMap from "@/components/profile/InteractiveMap";

export default function profilePage(){
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ethToMyr, setEthToMyr] = useState(12500); // Default conversion rate

    useEffect(() => {
        async function fetchUserDetails() {
            setIsLoading(true);
            setError(null);
            try {
                const { data: userData, error: authError } = await supabase.auth.getUser();
                if (authError) {
                    throw new Error(authError.message);
                }

                if (!userData?.user) {
                    throw new Error("No authenticated user found");
                }

                const { data: userDetails, error: userError } = await supabase
                    .from("users")
                    .select("wallet_address")
                    .eq("id", userData.user.id)
                    .single();

                if (userError) {
                    throw new Error(userError.message);
                }

                if (!userDetails?.wallet_address) {
                    throw new Error("No wallet address found for this user");
                }

                setWalletAddress(userDetails.wallet_address);

                // Fetch ETH to MYR conversion rate
                try {
                    const rateResponse = await fetch('/api/ethToMyr');
                    if (rateResponse.ok) {
                        const rateData = await rateResponse.json();
                        if (rateData.rate) {
                            setEthToMyr(rateData.rate);
                            console.log(`ETH to MYR rate: ${rateData.rate} (Source: ${rateData.source})`);
                        }
                    }
                } catch (rateError) {
                    console.error("Error fetching ETH to MYR rate:", rateError);
                    // Keep using the default rate
                }
            } catch (error: any) {
                console.error("Error fetching user details:", error);
                setError(error.message || "Failed to fetch user details");
            } finally {
                setIsLoading(false);
            }
        }
        fetchUserDetails();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen pt-24">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="bg-red-50 text-red-700 p-4 rounded-md">
                        <p>{error}</p>
                        {error.includes("No wallet address") && (
                            <p className="mt-2">
                                Please connect your wallet in the settings to view your profile.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 bg-gradient-to-b from-white to-teal-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow-sm rounded-lg p-6 border border-teal-100">
                    <h1 className="text-3xl font-bold text-teal-800 flex items-center gap-2 mb-4">
                        <UserCircle className="h-8 w-8 text-teal-600" />
                        <span>Donor Profile</span>
                    </h1>
                    <MilestoneTrackingPersonal/>
                    <InteractiveMap />
                </div>

                {walletAddress && (
                    <PersonalizedRecommendations walletAddress={walletAddress} />
                )}

                <Tabs defaultValue="transactions" className="w-full mx-auto mt-8 bg-white shadow-sm rounded-lg border border-teal-100 overflow-hidden">
                    <TabsList className="grid w-full grid-cols-3 p-1 bg-teal-50">
                        <TabsTrigger
                            value="transactions"
                            className="data-[state=active]:bg-white data-[state=active]:text-teal-800 data-[state=active]:shadow-sm py-3"
                        >
                            <ChartPieIcon className="h-4 w-4 mr-2" />
                            Transaction History
                        </TabsTrigger>
                        <TabsTrigger
                            value="donations"
                            className="data-[state=active]:bg-white data-[state=active]:text-teal-800 data-[state=active]:shadow-sm py-3"
                        >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Donation Report
                        </TabsTrigger>
                        <TabsTrigger
                            value="financial"
                            className="data-[state=active]:bg-white data-[state=active]:text-teal-800 data-[state=active]:shadow-sm py-3"
                        >
                            <Calculator className="h-4 w-4 mr-2" />
                            Financial Insights
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="transactions" className="p-0">
                        {walletAddress ? (
                            <WalletTransaction walletAddress={walletAddress} ethToMyr={ethToMyr}/>
                        ) : (
                            <div className="text-center py-12 bg-teal-50/50">
                                <p className="text-teal-800">No wallet address connected. Please connect your wallet to view transactions.</p>
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="donations" className="p-0">
                        {walletAddress ? (
                            <DonationReport walletAddress={walletAddress} ethToMyr={ethToMyr}/>
                        ) : (
                            <div className="text-center py-12 bg-teal-50/50">
                                <p className="text-teal-800">No wallet address connected. Please connect your wallet to view donations.</p>
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="financial" className="p-0">
                        {walletAddress ? (
                            <div className="p-6">
                                <FinancialInsights walletAddress={walletAddress} ethToMyr={ethToMyr} />
                                <TaxInsights
                                    walletAddress={walletAddress}
                                    ethToMyr={ethToMyr}
                                    totalDonated={{ eth: 0.212, myr: 0.212 * ethToMyr }}
                                />
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-teal-50/50">
                                <p className="text-teal-800">No wallet address connected. Please connect your wallet to view financial insights.</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                <div className="mt-8 bg-white shadow-sm rounded-lg border border-teal-100 overflow-hidden">
                    <Leaderboard/>
                </div>
            </div>
        </div>
    )
}