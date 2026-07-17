export const metadata = {
  title: {
    default: "Sign In — SmartPrice",
    template: "%s — SmartPrice",
  },
  description:
    "Sign in or create your SmartPrice account to start tracking prices, getting AI-powered recommendations, and saving money.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }) {
  return <>{children}</>;
}
