"use client"

import { withQueryClient } from "@/components/HOC/withQueryClient";
// import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HeroSection from "@/components/home/heroSection";
import CampaignSection from "@/components/home/campaignSection";

// const queryClient = new QueryClient();

function Home() {

  return (
    <div>
      <HeroSection />
      <CampaignSection />
    </div>
  )
}

export default Home;