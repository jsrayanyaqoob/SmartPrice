import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import UserSidebar from "@/components/layout/UserSidebar";
import Topbar from "@/components/layout/Topbar";
import AdminPortalButton from "@/components/AdminPortalButton";
import PortalContentWithBreadcrumbs from "@/components/layout/PortalContentWithBreadcrumbs";
import BackToTop from "@/components/ui/BackToTop";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-smartprice";

export const metadata = {
  title: {
    default: "Dashboard — SmartPrice",
    template: "%s | SmartPrice",
  },
  description:
    "Your personalized SmartPrice dashboard. Track prices, compare products, get AI recommendations, and manage alerts.",
};

export default async function UserPortalLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  const authDisabled = process.env.NEXT_PUBLIC_DISABLE_AUTH === "true" || process.env.NODE_ENV !== "production";

  if (!token && !authDisabled) {
    redirect("/login");
  }

  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      if (!authDisabled) {
        redirect("/login");
      }
    }
  }

  return (
    <div className="portal-layout">
      {/* Fixed Sidebar */}
      <UserSidebar />

      {/* Main Panel */}
      <div className="portal-main">
        {/* Sticky Topbar */}
        <Topbar showAnalyze={true} />

        {/* Portal Page Content */}
        <main className="portal-content"><PortalContentWithBreadcrumbs>{children}</PortalContentWithBreadcrumbs></main>
        <AdminPortalButton />
        <BackToTop />
      </div>
    </div>
  );
}
