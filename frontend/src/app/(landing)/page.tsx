import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import HowItWorks from "./components/HowItWorks";
import StatsSection from "./components/StatsSection";
import DemoSection from "./components/DemoSection";
import FAQSection from "./components/FAQSection";
import CTASection from "./components/CTASection";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <StatsSection />
      <DemoSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
