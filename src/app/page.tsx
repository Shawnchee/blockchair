import HeroSection from "@/components/home/heroSection"
import OurApproachSection from "@/components/home/our-approach-section"
import DonationFlowSection from "@/components/home/donation-flow-section"
import NewsletterSection from "@/components/home/newsletter"

import { withQueryClient } from "@/components/HOC/withQueryClient";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HeroSection from "@/components/home/heroSection";
import CampaignSection from "@/components/home/campaignSection";

const queryClient = new QueryClient();

function Home() {

  return (
    <main className="min-h-screen">
      <HeroSection />
      <OurApproachSection />
      <DonationFlowSection />
      <NewsletterSection />
    </main>
  )
}

