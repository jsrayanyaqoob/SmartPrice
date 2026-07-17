import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: {
    default: "SmartPrice — AI-Powered Price Comparison",
    template: "%s | SmartPrice",
  },
  description:
    "SmartPrice scans thousands of retailers in real-time to find you the lowest price. AI-powered price comparison, tracking, and deal alerts.",
};

export default function MarketingLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
