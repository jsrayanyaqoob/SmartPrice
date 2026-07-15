import Link from "next/link";
import HeroSection from "@/components/marketing/HeroSection";
import TrendingProducts from "@/components/marketing/TrendingProducts";
import CategoryGrid from "@/components/marketing/CategoryGrid";
import AIFeatures from "@/components/marketing/AIFeatures";
import LiveComparison from "@/components/marketing/LiveComparison";
import StatsBar from "@/components/marketing/StatsBar";
import Testimonials from "@/components/marketing/Testimonials";

export const metadata = {
  title: "SmartPrice — Shop Smarter with AI",
  description:
    "SmartPrice scans thousands of retailers in real-time to find you the absolute lowest price. Instant alerts, AI insights, and guaranteed savings.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrendingProducts />
      <CategoryGrid />
      <AIFeatures />
      <LiveComparison />
      <StatsBar />
      <Testimonials />
    </>
  );
}
