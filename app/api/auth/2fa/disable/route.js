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

    // If 2FA is enabled, verify the token before disabling
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

    if (dbUser?.twoFactorEnabled && dbUser?.twoFactorSecret) {
      // For safety, require a valid TOTP token to disable
      if (!token) {
        return NextResponse.json({ error: "Token required to disable 2FA" }, { status: 400 });
      }

      const isValid = totp.check(token, dbUser.twoFactorSecret);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid token" }, { status: 400 });
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: null, twoFactorEnabled: false },
    });

    return NextResponse.json({ success: true, message: "Two-factor authentication disabled." });
  } catch (error) {
    console.error("2FA disable error:", error);
    return NextResponse.json({ error: "Failed to disable 2FA" }, { status: 500 });
  }
}
