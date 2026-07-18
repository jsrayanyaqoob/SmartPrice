import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import PageLoader from "@/components/PageLoader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
  weight: ["400", "500", "600", "700"],
  adjustFontFallback: true,
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
    "smart shopping",
    "discount finder",
    "price drop alerts",
  ],
  authors: [{ name: "SmartPrice" }],
  creator: "SmartPrice",
  publisher: "SmartPrice",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://smartprice.io",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://smartprice.io",
    siteName: "SmartPrice",
    title: "SmartPrice — AI-Powered Price Comparison",
    description:
      "Shop smarter with AI. Track prices, get instant alerts, and save more.",
    images: [
      {
        url: "https://smartprice.io/og-image.png",
        width: 1200,
        height: 630,
        alt: "SmartPrice - AI Price Comparison",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartPrice — AI-Powered Price Comparison",
    description:
      "Shop smarter with AI. Track prices, get instant alerts, and save more.",
    images: ["https://smartprice.io/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f1a" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        {/* Prevent Flash of Wrong Theme — runs before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("smartprice-theme");var p=window.matchMedia("(prefers-color-scheme: dark)").matches;if(t==="dark"||(!t&&p)){document.documentElement.classList.add("dark")}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <PageLoader />
          {children}

          {/* JSON-LD Structured Data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                name: "SmartPrice",
                url: "https://smartprice.io",
                description:
                  "AI-powered price comparison and tracking platform. Scan thousands of retailers to find the lowest prices.",
                applicationCategory: "Shopping Application",
                operatingSystem: "Web",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                },
                author: {
                  "@type": "Organization",
                  name: "SmartPrice",
                },
              }),
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
