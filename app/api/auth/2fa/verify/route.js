import { NextResponse } from "next/server";
import { TOTP } from "otplib";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const totp = new TOTP();

export async function POST(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser?.twoFactorSecret) {
      return NextResponse.json({ error: "2FA not set up. Generate a secret first." }, { status: 400 });
    }

    const isValid = totp.check(token, dbUser.twoFactorSecret);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid token. Please try again." }, { status: 400 });
    }

    // Enable 2FA since verification passed
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: true },
    });

    return NextResponse.json({ success: true, message: "Two-factor authentication enabled successfully." });
  } catch (error) {
    console.error("2FA verify error:", error);
    return NextResponse.json({ error: "Failed to verify token" }, { status: 500 });
  }
}
