import HeroSection from "@/components/home/heroSection";
import OurApproachSection from "@/components/home/our-approach-section";
import DonationFlowSection from "@/components/home/donation-flow-section";
import NewsletterSection from "@/components/home/newsletter";
import GettingStartedSection from "@/components/home/gettingStartedSection";

function Home() {
  return (
    <main className="min-h-screen px-8 py-4">
      <HeroSection />
      <OurApproachSection />
      <DonationFlowSection />
      <NewsletterSection />
      <GettingStartedSection/>
    </main>
  );
}

export default Home;
