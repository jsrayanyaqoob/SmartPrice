import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Topbar from "@/components/layout/Topbar";
import AdminPortalButton from "@/components/AdminPortalButton";
import AdminToastProvider from "@/components/AdminToastProvider";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-smartprice";

export const metadata = {
  title: {
    default: "Admin Panel — SmartPrice",
    template: "%s | Admin — SmartPrice",
  },
  description: "SmartPrice admin panel for managing products, users, analytics, and platform configuration.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPortalLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    if (user.email !== "rayanyaqoob83@gmail.com" || user.role !== "Admin") {
      redirect("/dashboard");
    }
  } catch (error) {
    redirect("/login");
  }

  return (
    <div className="portal-layout">
      {/* Fixed Sidebar */}
      <AdminSidebar />

      {/* Main Panel */}
      <div className="portal-main">
        {/* Sticky Topbar */}
        <Topbar searchPlaceholder="Search admin metrics, stores, products..." settingsHref="/admin/settings" />

        {/* Portal Page Content */}
        <main className="portal-content"><AdminToastProvider>{children}</AdminToastProvider></main>
        <AdminPortalButton />
      </div>
    </div>
  );
}
