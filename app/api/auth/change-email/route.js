import { NextResponse } from "next/server";
import crypto from "crypto";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/auth/change-email - initiate email change with verification token
export async function POST(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { newEmail } = await request.json();
    if (!newEmail || !newEmail.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    // Check if email is already taken
    const existing = await prisma.user.findFirst({
      where: { email: newEmail, NOT: { id: user.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString("hex");

    // Store the pending email change
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailChangeToken: token,
        emailChangeNewEmail: newEmail,
      },
    });

    // In production, send an email with a verification link:
    // `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/change-email/confirm?token=${token}`
    // For now, return the token so the user can confirm

    return NextResponse.json({
      success: true,
      message: "Verification email sent to " + newEmail,
      // In development, return the token for testing
      ...(process.env.NODE_ENV === "development" && { verificationToken: token }),
    });
  } catch (error) {
    console.error("Email change error:", error);
    return NextResponse.json({ error: "Failed to initiate email change" }, { status: 500 });
  }
}

// GET /api/auth/change-email?token=xxx - confirm email change
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Verification token is required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { emailChangeToken: token },
    });

    if (!user || !user.emailChangeNewEmail) {
      return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 });
    }

    // Update the email and clear the change fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.emailChangeNewEmail,
        emailChangeToken: null,
        emailChangeNewEmail: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Email updated successfully.",
    });
  } catch (error) {
    console.error("Email confirm error:", error);
    return NextResponse.json({ error: "Failed to confirm email change" }, { status: 500 });
  }
}
