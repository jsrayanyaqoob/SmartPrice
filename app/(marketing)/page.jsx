import dynamic from "next/dynamic";

// HeroSection is above the fold — load eagerly
import HeroSection from "@/components/marketing/HeroSection";

// Everything below the fold — lazy-loaded via dynamic import with SSR: true (for SEO)
const ScrollReveal = dynamic(() => import("@/components/marketing/ScrollReveal"), {
  ssr: true,
});
const TrendingProducts = dynamic(() => import("@/components/marketing/TrendingProducts"), {
  ssr: true,
  loading: () => <div style={{ height: 460, background: "var(--bg-app)" }} />,
});
// Shared minimal skeleton for below-fold sections to prevent layout shift
const SectionSkeleton = () => (
  <div style={{ height: 300, background: "var(--bg-app)", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div className="skeleton-pulse" style={{ width: 40, height: 40, borderRadius: "50%" }} />
  </div>
);

const HowItWorks = dynamic(() => import("@/components/marketing/HowItWorks"), { ssr: true, loading: SectionSkeleton });
const CategoryGrid = dynamic(() => import("@/components/marketing/CategoryGrid"), { ssr: true, loading: SectionSkeleton });
const AIFeatures = dynamic(() => import("@/components/marketing/AIFeatures"), { ssr: true, loading: SectionSkeleton });
const LiveComparison = dynamic(() => import("@/components/marketing/LiveComparison"), { ssr: true, loading: SectionSkeleton });
const StatsBar = dynamic(() => import("@/components/marketing/StatsBar"), { ssr: true, loading: SectionSkeleton });
const PricingSection = dynamic(() => import("@/components/marketing/PricingSection"), { ssr: true, loading: SectionSkeleton });
const FAQSection = dynamic(() => import("@/components/marketing/FAQSection"), { ssr: true, loading: SectionSkeleton });
const Testimonials = dynamic(() => import("@/components/marketing/Testimonials"), { ssr: true, loading: SectionSkeleton });
const NewsletterSection = dynamic(() => import("@/components/marketing/NewsletterSection"), { ssr: true, loading: SectionSkeleton });

export const metadata = {
  title: "SmartPrice — Shop Smarter with AI",
  description:
    "SmartPrice scans thousands of retailers in real-time to find you the absolute lowest price. Instant alerts, AI insights, and guaranteed savings.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ScrollReveal delay={0.1}><TrendingProducts /></ScrollReveal>
      <ScrollReveal delay={0.15}><HowItWorks /></ScrollReveal>
      <ScrollReveal delay={0.1}><CategoryGrid /></ScrollReveal>
      <ScrollReveal delay={0.15}><AIFeatures /></ScrollReveal>
      <ScrollReveal delay={0.1}><LiveComparison /></ScrollReveal>
      <ScrollReveal delay={0.15}><StatsBar /></ScrollReveal>
      <ScrollReveal delay={0.1}><PricingSection /></ScrollReveal>
      <ScrollReveal delay={0.15}><FAQSection /></ScrollReveal>
      <ScrollReveal delay={0.1}><Testimonials /></ScrollReveal>
      <ScrollReveal delay={0.15}><NewsletterSection /></ScrollReveal>
    </>
  );
}
