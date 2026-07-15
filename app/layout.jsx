import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: {
    default: "SmartPrice — AI-Powered Price Comparison",
    template: "%s | SmartPrice",
  },
  description:
    "SmartPrice scans thousands of retailers in real-time to find you the absolute lowest price. Instant alerts, AI insights, and guaranteed savings.",
  keywords: [
    "price comparison",
    "price tracking",
    "AI shopping",
    "deal alerts",
    "best price",
  ],
  authors: [{ name: "SmartPrice" }],
  creator: "SmartPrice",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://smartprice.io",
    title: "SmartPrice — AI-Powered Price Comparison",
    description:
      "Shop smarter with AI. Track prices, get instant alerts, and save more.",
    siteName: "SmartPrice",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartPrice — AI-Powered Price Comparison",
    description:
      "Shop smarter with AI. Track prices, get instant alerts, and save more.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
