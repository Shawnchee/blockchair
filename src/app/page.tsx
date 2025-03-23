import HeroSection from "@/components/home/heroSection";
import OurApproachSection from "@/components/home/our-approach-section";
import DonationFlowSection from "@/components/home/donation-flow-section";
import NewsletterSection from "@/components/home/newsletter";
import CampaignSection from "@/components/home/campaignSection";

function Home() {
  return (
    <main className="min-h-screen px-8 py-4">
      <HeroSection />
      <OurApproachSection />
      <DonationFlowSection />
      <NewsletterSection />
    </main>
  );
}

export default Home;
