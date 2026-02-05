import NavBar from "@/components/home/NavBar";
import HeroSection from "@/components/home/HeroSection";
import IntroductionSection from "@/components/home/IntroductionSection";
import ActivitySection from "@/components/home/ActivitySection";
import FooterSection from "@/components/home/FooterSection";
import SponsorSection from "@/components/home/SponsorSection";
import SponsorProfileSection from "@/components/home/SponsorProfileSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-ismc-cream selection:bg-ismc-orange selection:text-white">
      <NavBar />
      <HeroSection />
      <IntroductionSection />
      <ActivitySection />
      <SponsorProfileSection />
      <SponsorSection />
      <FooterSection />
    </main>
  );
}