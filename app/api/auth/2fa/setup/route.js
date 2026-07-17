import { NextResponse } from "next/server";
import { TOTP } from "otplib";
import qrcode from "qrcode";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const totp = new TOTP();

export async function POST(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Generate a new TOTP secret
    const secret = totp.generateSecret();
    const serviceName = "SmartPrice";

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    const otpauth = `otpauth://totp/${serviceName}:${encodeURIComponent(dbUser?.email || user.email)}?secret=${secret}&issuer=${serviceName}`;

    // Generate QR code as data URL
    const qrCode = await qrcode.toDataURL(otpauth);

    // Store the secret temporarily (not enabled yet until verified)
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret, twoFactorEnabled: false },
    });

    return NextResponse.json({
      success: true,
      secret,
      qrCode,
      uri: otpauth,
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    return NextResponse.json({ error: "Failed to setup 2FA" }, { status: 500 });
  }
}
